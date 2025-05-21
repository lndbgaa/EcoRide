import dayjs from "dayjs";
import { Op } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import { Booking, Review, Ride, User } from "@/models/mysql/index.js";
import UploadService from "@/services/upload.service.js";
import AppError from "@/utils/AppError.js";

import type { UserRole } from "@/types/index.js";
import type { FindOptions, Transaction } from "sequelize";

type UpcomingEvent = { type: "booking"; data: Booking } | { type: "ride"; data: Ride };

interface UserUpdateInfoData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  pseudo?: string;
}

class UserService {
  /**
   * Vérifie si un utilisateur existe et le retourne
   * @param userId - L'id de l'utilisateur
   * @returns Le user trouvé
   */
  public static async findUserOrThrow(userId: string, options?: FindOptions): Promise<User> {
    const user = await User.findOne({
      where: { id: userId },
      ...options,
    });

    if (!user) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Utilisateur non trouvé. Veuillez vérifier l'id de l'utilisateur.",
      });
    }

    return user;
  }

  /**
   * Vérifie si un utilisateur est chauffeur
   * @param userId - L'id de l'utilisateur
   * @returns Le user trouvé
   */
  public static async assertUserIsDriverOrThrow(userId: string, options?: FindOptions): Promise<User> {
    const user = await UserService.findUserOrThrow(userId, options);

    if (!user.isDriver()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Seuls les utilisateurs chauffeurs peuvent accéder à cette ressource. ",
      });
    }

    return user;
  }

  /**
   * Vérifie si un utilisateur est passager
   * @param userId - L'id de l'utilisateur
   * @returns Le user trouvé
   */
  public static async assertUserIsPassengerOrThrow(userId: string, options?: FindOptions): Promise<User> {
    const user = await UserService.findUserOrThrow(userId, options);

    if (!user.isPassenger()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Seuls les utilisateurs passagers peuvent accéder à cette ressource.",
      });
    }

    return user;
  }

  /**
   * Récupère les informations d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Les informations de l'utilisateur
   */
  public static async getInfo(userId: string): Promise<User> {
    const user = await this.findUserOrThrow(userId);
    return user;
  }

  /**
   * Met à jour les informations d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param data - Les données à mettre à jour
   * @returns Les informations de l'utilisateur mises à jour
   */
  public static async updateInfo(userId: string, data: UserUpdateInfoData): Promise<User> {
    const user = await this.findUserOrThrow(userId);

    const dataToUpdate = {
      ...(data.firstName && { first_name: data.firstName }),
      ...(data.lastName && { last_name: data.lastName }),
      ...(data.birthDate && {
        birth_date: dayjs(data.birthDate, "YYYY-MM-DD").toDate(),
      }),
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address }),
      ...(data.pseudo && { pseudo: data.pseudo }),
    };

    return await sequelize.transaction(async (transaction) => {
      await User.update(dataToUpdate, { where: { id: user.getId() }, transaction });

      const updatedUser = await User.findOne({ where: { id: user.getId() }, transaction });

      if (!updatedUser) {
        throw new AppError({
          statusCode: 500,
          statusText: "Internal Server Error",
          message: "Une erreur est survenue lors de la mise à jour des informations de l'utilisateur.",
        });
      }

      return updatedUser;
    });
  }

  /**
   * Met à jour le rôle d'un utilisateur (chauffeur ou passager)
   * @param role - Le rôle à mettre à jour
   * @param userId - L'id de l'utilisateur
   */
  public static async updateRole(role: UserRole, userId: string): Promise<void> {
    const user = await this.findUserOrThrow(userId);

    if (role === "driver") {
      await user.toggleDriver();
    } else {
      await user.togglePassenger();
    }
  }

  /**
   * Met à jour l'avatar d'un utilisateur
   * @param file - Le fichier du nouvel avatar
   * @param userId - L'id de l'utilisateur
   * @returns L'url de l'avatar mis à jour
   */
  public static async updateAvatar(file: Express.Multer.File, userId: string): Promise<{ url: string }> {
    const user = await this.findUserOrThrow(userId);

    const { secure_url } = await UploadService.uploadImage(file, `ecoride/users/${userId}/profile-picture`);

    await User.update({ profile_picture: secure_url }, { where: { id: user.getId() } });

    return { url: secure_url };
  }

  /**
   * Met à jour la note moyenne d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param options - Options sequelize
   */
  public static async updateAverageRating(userId: string, options?: { transaction?: Transaction }) {
    const user = await this.findUserOrThrow(userId);

    const reviews = await Review.findAll({
      where: { target_id: user.getId() },
      ...options,
    });

    if (reviews.length === 0) {
      await User.update({ average_rating: null }, { where: { id: user.getId() }, ...options });
      return;
    }

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    await User.update({ average_rating: averageRating }, { where: { id: user.getId() }, ...options });
  }

  /**
   * Récupère le prochain événement (réservation ou trajet) à venir d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Le prochain événement à venir
   */
  public static async getNextEvent(userId: string): Promise<Booking | Ride | null> {
    const user = await this.findUserOrThrow(userId);

    const now = dayjs().toDate();

    const nextBooking: Booking | null = await Booking.findOne({
      where: { passenger_id: userId, status: "confirmed" },
      include: [{ association: "ride" }],
      order: [[{ model: Ride, as: "ride" }, "departure_datetime", "ASC"]],
    });

    const nextRide: Ride | null = await Ride.findOne({
      where: {
        driver_id: userId,
        status: { [Op.in]: ["open", "full", "in_progress"] },
        departure_datetime: { [Op.gt]: now },
      },
      order: [["departure_datetime", "ASC"]],
    });

    if (nextBooking && nextRide) {
      const bookingDate = nextBooking.ride?.departure_datetime;
      const rideDate = nextRide.departure_datetime;

      return bookingDate && bookingDate < rideDate ? nextBooking : nextRide;
    }

    return nextBooking || nextRide || null;
  }

  /**
   * Récupère tous les événements à venir (trajets ou réservations) d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Un tableau d'événements (Booking ou Ride) triés par date de départ
   */
  public static async getUpcomingEvents(userId: string): Promise<UpcomingEvent[]> {
    const user: User = await this.findUserOrThrow(userId);

    const now = dayjs().toDate();

    const upcomingBookings: Booking[] = await Booking.findAll({
      where: { passenger_id: user.id, status: "confirmed" },
      include: [{ association: "ride" }],
      order: [[{ model: Ride, as: "ride" }, "departure_datetime", "ASC"]],
    });

    const upcomingRides: Ride[] = await Ride.findAll({
      where: {
        driver_id: user.id,
        status: { [Op.in]: ["open", "full"] },
        departure_datetime: { [Op.gt]: now },
      },
      order: [["departure_datetime", "ASC"]],
    });

    const typedBookings = upcomingBookings.map((booking) => {
      return { type: "booking" as const, data: booking };
    });

    const typedRides = upcomingRides.map((ride) => {
      return { type: "ride" as const, data: ride };
    });

    return [...typedBookings, ...typedRides].sort((a, b) => {
      const dateA = a.type === "ride" ? a.data.departure_datetime : a.data.ride?.departure_datetime;
      const dateB = b.type === "ride" ? b.data.departure_datetime : b.data.ride?.departure_datetime;

      if (!dateA || !dateB) return 0;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }
}

export default UserService;
