import { sequelize } from "@/config/mysql.config.js";
import { Booking } from "@/models/mysql";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";
import type { FindOptions } from "sequelize";

class BookingService {
  /**
   * Vérifie si une réservation existe et la retourne
   * @param bookingId - L'id de la réservation
   * @returns La réservation trouvée
   */
  public static async findBookingOrThrow(
    bookingId: string,
    options?: FindOptions
  ): Promise<Booking> {
    const booking = await Booking.findOneByField("id", bookingId, options);

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
    const booking = await this.findBookingOrThrow(bookingId, options);

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
   * Crée une réservation pour un trajet
   * @param userId - L'id de l'utilisateur qui réserve
   * @param rideId - L'id du trajet
   * @param seatsBooked - Le nombre de places réservées
   * @returns La réservation créée
   */
  public static async createBooking(
    userId: string,
    rideId: string,
    seatsBooked: number
  ): Promise<Booking> {
    const user = await UserService.assertUserIsPassengerOrThrow(userId);
    const ride = await RideService.findRideOrThrow(rideId);

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

    const hasUserAlreadyBooked = !!(await Booking.findOneByField("ride_id", rideId, {
      where: {
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
      const booking = await Booking.createOne(
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
  public static async cancelBooking(userId: string, bookingId: string): Promise<void> {
    const user = await UserService.findUserOrThrow(userId);
    const booking = await this.findOwnedBookingOrThrow(userId, bookingId);
    const ride = await RideService.findRideOrThrow(booking.getRideId());

    await sequelize.transaction(async (transaction) => {
      await booking.markAsCancelled({ transaction });
      await ride.addAvailableSeats(booking.getSeatsBooked(), { transaction });
      await user.addCredits(ride.getPrice() * booking.getSeatsBooked(), { transaction });
    });
  }

  /**
   * Récupère toutes les réservations confirmées pour un trajet
   * @param rideId - L'id du trajet
   * @returns Les réservations trouvées
   */
  public static async getRideBookings(rideId: string, options?: FindOptions): Promise<Booking[]> {
    const ride = await RideService.findRideOrThrow(rideId);

    const bookings = await Booking.findAllByField("ride_id", ride.id, {
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
  public static async getUserBookings(userId: string): Promise<Booking[]> {
    const bookings = await Booking.findAllByField("passenger_id", userId, {
      include: [{ association: "ride" }],
    });

    return bookings;
  }
}

export default BookingService;
