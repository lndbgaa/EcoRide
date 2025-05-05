import { sequelize } from "@/config/mysql.config.js";
import { PLATFORM_CREDITS_PER_SEAT } from "@/constants/index.js";
import { Booking, Ride, User } from "@/models/mysql";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

import type { FindOptions } from "sequelize";

class BookingService {
  /**
   * Vérifie si une réservation existe
   * @param bookingId - L'id de la réservation
   * @returns La réservation trouvée
   */
  public static async findBookingOrThrow(bookingId: string, options?: FindOptions): Promise<Booking> {
    const booking: Booking | null = await Booking.findOne({
      where: { id: bookingId },
      ...options,
    });

    if (!booking) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Réservation non trouvé.",
      });
    }

    return booking;
  }

  /**
   * Vérifie si une réservation appartient bien à un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param bookingId - L'id de la réservation
   * @returns La réservation trouvée
   */
  public static async findOwnedBookingOrThrow(
    userId: string,
    bookingId: string,
    options?: FindOptions
  ): Promise<Booking> {
    const booking: Booking = await this.findBookingOrThrow(bookingId, options);

    if (booking.getPassengerId() !== userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'avez pas les permissions pour accéder à cette réservation.",
      });
    }

    return booking;
  }

  /**
   * Vérifie si une réservation peut être annulée
   * @param booking - La réservation à vérifier
   */
  private static assertBookingCanBeCancelled(booking: Booking): void {
    if (booking.isCancelled()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Vous avez déjà annulé cette réservation.",
      });
    }

    if (!booking.isConfirmed()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Impossible d'annuler cette réservation.",
        details: {
          currentStatus: booking.getStatus(),
        },
      });
    }
  }

  /**
   * Vérifie si une réservation peut être validée
   * @param booking - La réservation à vérifier
   */
  private static assertBookingCanBeValidated(booking: Booking): void {
    if (booking.isCompleted()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Vous avez déjà validé cette réservation.",
      });
    }

    if (!booking.isAwaitingFeedback()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Impossible de valider cette réservation.",
        details: {
          currentStatus: booking.getStatus(),
        },
      });
    }
  }

  /**
   * Crée une réservation pour un trajet
   * @param userId - L'id de l'utilisateur qui réserve
   * @param rideId - L'id du trajet
   * @param seatsBooked - Le nombre de places réservées
   * @returns La réservation créée
   */
  public static async createBooking(userId: string, rideId: string, seatsBooked: number): Promise<Booking> {
    const user: User = await UserService.assertUserIsPassengerOrThrow(userId);
    const ride: Ride = await RideService.findRideOrThrow(rideId);

    if (!ride.isOpen()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le trajet est complet ou indisponible.",
      });
    }

    if (ride.getDriverId() === userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous ne pouvez pas réserver votre propre trajet.",
      });
    }

    const hasUserAlreadyBooked = !!(await Booking.findOne({
      where: {
        ride_id: rideId,
        passenger_id: userId,
        status: "confirmed",
      },
    }));

    if (hasUserAlreadyBooked) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous avez déjà une réservation en cours pour ce trajet.",
      });
    }

    if (seatsBooked > ride.getAvailableSeats()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Il n'y a pas assez de places disponibles pour réserver ce trajet.",
      });
    }

    const ridePrice = ride.getPrice();
    const totalPrice = ridePrice * seatsBooked;
    const userCredits = user.getCredits();

    if (userCredits < totalPrice) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'avez pas assez de crédits pour réserver ce trajet.",
      });
    }

    return await sequelize.transaction(async (transaction) => {
      const booking: Booking = await Booking.create(
        {
          ride_id: rideId,
          passenger_id: userId,
          seats_booked: seatsBooked,
        },
        { transaction }
      );

      await ride.removeAvailableSeats(seatsBooked, { transaction });
      await user.removeCredits(totalPrice, { transaction });

      return booking;
    });
  }

  /**
   * Annule une réservation
   * @param userId - L'id de l'utilisateur
   * @param bookingId - L'id de la réservation
   */
  public static async cancelBooking(userId: string, booking: Booking): Promise<void> {
    this.assertBookingCanBeCancelled(booking);

    const user: User = await UserService.findUserOrThrow(userId);
    const ride: Ride = await RideService.findRideOrThrow(booking.getRideId());

    await sequelize.transaction(async (transaction) => {
      await booking.markAsCancelled({ transaction });
      await ride.addAvailableSeats(booking.getSeatsBooked(), { transaction });
      await user.addCredits(ride.getPrice() * booking.getSeatsBooked(), {
        transaction,
      });
    });
  }

  /**
   * Valide une réservation dont le trajet s'est bien déroulé.
   * Le conducteur est crédité du prix du trajet moins la commission de la plateforme.
   *
   * @param userId - L'id de l'utilisateur
   * @param bookingId - L'id de la réservation
   */
  public static async confirmSuccessfulBooking(booking: Booking): Promise<void> {
    this.assertBookingCanBeValidated(booking);

    const ride: Ride = await RideService.findRideOrThrow(booking.getRideId());
    const driver: User = await UserService.findUserOrThrow(ride.getDriverId());

    const totalPrice = ride.getPrice() * booking.getSeatsBooked();
    const platformFee = PLATFORM_CREDITS_PER_SEAT * booking.getSeatsBooked();

    await sequelize.transaction(async (transaction) => {
      await booking.markAsCompleted({ transaction });
      await driver.addCredits(totalPrice - platformFee, { transaction });
    });
  }

  /**
   * Valide une réservation dont le trajet s'est mal déroulé.
   * Le conducteur n'est pas crédité, car un incident a été déclaré.
   *
   * @param userId - L'id de l'utilisateur
   * @param bookingId - L'id de la réservation
   */
  public static async confirmBookingWithIncident(booking: Booking): Promise<void> {
    this.assertBookingCanBeValidated(booking);

    await sequelize.transaction(async (transaction) => {
      await booking.markAsCompleted({ transaction });
    });
  }

  /**
   * Récupère toutes les réservations confirmées pour un trajet
   * @param rideId - L'id du trajet
   * @returns Les réservations trouvées
   */
  public static async getRideBookings(rideId: string, options?: FindOptions): Promise<Booking[]> {
    const ride: Ride = await RideService.findRideOrThrow(rideId);

    const bookings: Booking[] = await Booking.findAll({
      where: { ride_id: ride.id },
      include: [{ association: "passenger" }],
      ...options,
    });

    return bookings;
  }

  /**
   * Récupère toutes les réservations d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Les réservations trouvées
   */
  public static async getUserBookings(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ count: number; bookings: Booking[] }> {
    const { count, rows: bookings }: { count: number; rows: Booking[] } = await Booking.findAndCountAll({
      where: { passenger_id: userId },
      include: [{ association: "ride", include: [{ association: "driver" }] }],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return { count, bookings };
  }
}

export default BookingService;
