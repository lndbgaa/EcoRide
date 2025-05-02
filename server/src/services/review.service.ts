import type { ReviewStatus } from "@/models/mysql/Review.model.js";
import type { FindOptions } from "sequelize";

import { sequelize } from "@/config/mysql.config.js";
import Review from "@/models/mysql/Review.model.js";
import BookingService from "@/services/booking.service.js";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

interface CreateReviewData {
  rideId: string;
  rating: number;
  comment: string;
}

class ReviewService {
  public static async findReviewOrThrow(reviewId: string): Promise<Review> {
    const review = await Review.findOneByField("id", reviewId);

    if (!review) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Avis non trouvé.",
      });
    }

    return review;
  }

  /**
   * Crée un avis
   * @param userId - L'id de l'utilisateur qui crée l'avis
   * @param data - Les données de l'avis à créer
   */
  public static async createReview(
    userId: string,
    data: CreateReviewData
  ): Promise<void> {
    const ride = await RideService.findRideOrThrow(data.rideId);

    if (ride.getDriverId() === userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous ne pouvez pas évaluer votre propre trajet.",
      });
    }

    if (!ride.isCompleted()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Ce trajet ne peut pas être évalué.",
        details: {
          status: ride.getStatus(),
        },
      });
    }

    const rideBookings = await BookingService.getRideBookings(ride.getId(), {
      where: { status: "completed" },
    });

    const isRidePassenger = rideBookings.some(
      (booking) => booking.getPassengerId() === userId
    );

    if (!isRidePassenger) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'êtes pas autorisé à évaluer ce trajet.",
      });
    }

    const reviewCount = await Review.countAllByField("ride_id", data.rideId, {
      where: {
        author_id: userId,
      },
    });

    if (reviewCount > 0) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Vous avez déjà laissé un avis pour ce trajet.",
      });
    }

    await Review.createOne({
      ride_id: data.rideId,
      target_id: ride.getDriverId(),
      author_id: userId,
      rating: data.rating,
      comment: data.comment,
    });
  }

  /**
   * Récupère les avis en fonction du statut
   * @param status - Le statut des avis à récupérer
   * @returns Liste des avis trouvés
   */
  public static async getReviewsByStatus(
    status: ReviewStatus,
    limit: number,
    offset: number
  ): Promise<{ count: number; reviews: Review[] }> {
    const filter = status ? { status } : {};

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: filter,
      order: [["created_at", "DESC"]],
      include: [
        { association: "author", required: false },
        { association: "target", required: false },
        { association: "ride", required: false },
        { association: "moderator", required: false },
      ],
      offset,
      limit,
    });

    return { count, reviews };
  }

  /**
   * Récupère les avis (validés) reçus par un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param options - Options sequelize
   * @returns Liste des avis reçus
   */
  public static async getUserReceivedReviews(
    userId: string,
    limit: number,
    offset: number,
    options?: FindOptions
  ): Promise<{ count: number; reviews: Review[] }> {
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { target_id: userId, status: "approved" },
      include: [{ association: "author" }],
      ...options,
      offset,
      limit,
    });

    return { count, reviews };
  }

  /**
   * Récupère les avis (validés) écrits par un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param options - Options sequelize
   * @returns Liste des avis écrits
   */
  public static async getUserWrittenReviews(
    userId: string,
    limit: number,
    offset: number,
    options?: FindOptions
  ): Promise<{ count: number; reviews: Review[] }> {
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { author_id: userId, status: "approved" },
      include: [{ association: "target" }],
      ...options,
      offset,
      limit,
    });

    return { count, reviews };
  }

  /**
   * Modère un avis
   * @param reviewId - L'id de l'avis à modérer
   * @param employeeId - L'id de l'employé qui modère l'avis
   * @param status - Le nouveau statut de l'avis
   */
  public static async moderateReview(
    reviewId: string,
    employeeId: string,
    status: Omit<ReviewStatus, "pending">
  ): Promise<void> {
    const review = await this.findReviewOrThrow(reviewId);

    if (!review.isPending()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Cet avis a déjà été traité.",
      });
    }

    return await sequelize.transaction(async (transaction) => {
      await Review.updateByField(
        "id",
        reviewId,
        {
          status,
          moderator_id: employeeId,
        },
        { transaction }
      );

      const targetId = review.getTargetId();

      if (status === "approved" && targetId) {
        await UserService.updateAverageRating(targetId, { transaction });
      }
    });
  }
}

export default ReviewService;
