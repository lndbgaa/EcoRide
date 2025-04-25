import { sequelize } from "@/config/mysql.config";
import { Booking, Ride, User } from "@/models/mysql";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError";
import RideService from "./ride.service";

class BookingService {
  /**
   * Crée une réservation pour un trajet
   * @param userId - L'id de l'utilisateur
   * @param rideId - L'id du trajet
   * @param seatsBooked - Le nombre de places réservées
   * @returns La réservation créée
   */
  public static async createBooking(userId: string, rideId: string, seatsBooked: number = 1) {
    const user: User = await UserService.assertUserIsPassengerOrThrow(userId);
    const ride: Ride = await RideService.findRideOrThrow(rideId);

    if (!ride.isOpen()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le trajet est complet ou indisponible.",
      });
    }

    if (ride.driver_id === userId) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Vous ne pouvez pas réserver votre propre trajet.",
      });
    }

    const hasUserAlreadyBooked: boolean = !!(await Booking.findOneByField("ride_id", rideId, {
      where: {
        passenger_id: userId,
      },
    }));

    if (hasUserAlreadyBooked) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Vous avez déjà réservé ce trajet.",
      });
    }

    const ridePrice: number = ride.getPrice();
    const userCredits: number = user.getCredits();

    if (userCredits < ridePrice) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Vous n'avez pas assez de crédits pour réserver ce trajet.",
      });
    }

    return await sequelize.transaction(async (transaction) => {
      const booking: Booking = await Booking.createOne(
        {
          ride_id: rideId,
          passenger_id: userId,
        },
        { transaction }
      );

      await user.removeCredits(ridePrice, { transaction });
      await ride.removeSeats(seatsBooked, { transaction });

      return booking;
    });
  }
}
export default BookingService;
