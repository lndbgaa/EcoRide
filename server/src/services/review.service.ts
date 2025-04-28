import Review from "@/models/mysql/Review.model.js";
import AppError from "@/utils/AppError.js";
import BookingService from "./booking.service.js";
import RideService from "./ride.service.js";

interface CreateReviewData {
  rideId: string;
  rating: number;
  comment: string;
}

class ReviewService {
  public static async createReview(userId: string, data: CreateReviewData) {
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

    const isRidePassenger = rideBookings.some((booking) => booking.getPassengerId() === userId);

    if (!isRidePassenger) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'êtes pas autorisé à évaluer ce trajet.",
      });
    }

    const hasAlreadyReviewed = await Review.findOneByField("ride_id", data.rideId, {
      where: {
        author_id: userId,
      },
    });

    if (hasAlreadyReviewed) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Vous avez déjà laissé un avis pour ce trajet.",
      });
    }

    await Review.create({
      ride_id: data.rideId,
      target_id: ride.getDriverId(),
      author_id: userId,
      rating: data.rating,
      comment: data.comment,
    });
  }
}

export default ReviewService;
