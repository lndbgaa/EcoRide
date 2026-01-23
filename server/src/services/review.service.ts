import { col, fn } from "sequelize";

import { sequelize } from "@/config";
import { BOOKING_STATUSES, COMMON_ERROR_MESSAGES, REVIEW_ERROR_MESSAGES, REVIEW_STATUSES } from "@/constants";
import { Review, User } from "@/models";
import { TripService } from "@/services";
import { AppError } from "@/utils";

import type {
  CreateReviewPayload,
  GetReviewsFilters,
  GetReviewsResponse,
  GetReviewsSortOptions,
  ReviewDBFilter,
  ReviewStatus,
} from "@/types";
import type { FindOptions, Order, WhereOptions } from "sequelize";

const { APPROVED, PENDING } = REVIEW_STATUSES;

export class ReviewService {
  /**
   * Finds a review by ID.
   *
   * @param {string} reviewId - The ID of the review to find.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<Review>} The review instance.
   * @throws {AppError} 404 if the review is not found.
   */
  public static async findById(reviewId: string, options?: FindOptions): Promise<Review> {
    const review = await Review.findByPk(reviewId, options);

    if (!review) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `Review '${reviewId}' not found in database.`,
      });
    }

    return review;
  }

  /**
   * Retrieves all reviews with pagination, optional filters, and sorting.
   *
   * @param {number} limit - Maximum number of reviews to return.
   * @param {number} offset - Number of reviews to skip (for pagination).
   * @param {GetReviewsFilters} [filters] - Optional filters:
   *  - status: filter reviews by status
   *  - targetId: filter reviews by target ID
   *  - authorId: filter reviews by author ID
   * @param {GetReviewsSortOptions} [sortOptions] - Optional sort options:
   *  - by: 'createdAt' | 'rating' (default: 'createdAt')
   *  - dir: 'asc' | 'desc' (default: 'desc')
   * @param {Partial<FindOptions>} [options] - Additional Sequelize find options (include, attributes, etc.).
   * @returns {Promise<GetReviewsResponse>} Object containing total count and list of reviews.
   */
  public static async findAll(
    limit: number,
    offset: number,
    filters?: GetReviewsFilters,
    sortOptions?: GetReviewsSortOptions,
    options?: Partial<FindOptions>
  ): Promise<GetReviewsResponse> {
    const where: WhereOptions<ReviewDBFilter> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.targetId) where.target_id = filters.targetId;
    if (filters?.authorId) where.author_id = filters.authorId;

    const sortFieldMap: Record<string, string> = {
      createdAt: "created_at",
      rating: "rating",
    };

    const sortField = sortFieldMap[sortOptions?.by ?? "createdAt"] ?? "created_at";
    const sortDirection = sortOptions?.dir === "asc" ? "ASC" : "DESC";
    const order: Order = [[sortField, sortDirection]];

    const { count, rows } = await Review.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: options?.include,
      distinct: true,
    });

    return { count, reviews: rows };
  }

  /**
   * Creates a new review for a completed trip.
   *
   * @param {User} user - The user creating the review.
   * @param {CreateReviewPayload} data - The review data (tripId, rating, comment).
   * @returns {Promise<void>}
   * @throws {AppError} 404 if the trip is not found (from TripService.findById()).
   * @throws {AppError} 403 if the user is the driver of the trip.
   * @throws {AppError} 409 if the trip is not completed.
   * @throws {AppError} 403 if the user has no completed booking for the trip.
   * @throws {AppError} 409 if the user has already reviewed the trip.
   */
  public static async create(user: User, data: CreateReviewPayload): Promise<void> {
    const { tripId, rating, comment } = data;

    return sequelize.transaction(async (t) => {
      const trip = await TripService.findById(tripId, {
        include: [
          {
            association: "bookings",
            where: {
              passenger_id: user.id,
              status: BOOKING_STATUSES.COMPLETED,
            },
            required: false,
          },
        ],
        transaction: t,
      });

      if (trip.driver_id === user.id) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.IS_DRIVER,
          debugMessage: `Cannot create review: User '${user.id}' is the driver of trip '${tripId}'.`,
        });
      }

      if (!trip.isCompleted()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.TRIP_NOT_COMPLETED,
          debugMessage: `Cannot create review: Trip '${tripId}' is not completed (current status: '${trip.status}').`,
        });
      }

      const hasCompletedBooking = trip.bookings && trip.bookings.length > 0;

      if (!hasCompletedBooking) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.BOOKING_NOT_COMPLETED,
          debugMessage: `Cannot create review: User '${user.id}' has no completed booking for trip '${tripId}'.`,
        });
      }

      const existingReview = !!(await Review.count({
        where: { trip_id: tripId, author_id: user.id },
      }));

      if (existingReview) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.ALREADY_REVIEWED,
          debugMessage: `Cannot create review: User '${user.id}' has already reviewed trip '${tripId}'.`,
        });
      }

      await Review.create(
        {
          trip_id: tripId,
          target_id: trip.driver_id,
          author_id: user.id,
          rating,
          comment,
        },
        { transaction: t }
      );
    });
  }

  /**
   * Moderates a review by approving or rejecting it.
   *
   * @param {string} reviewId - The ID of the review to moderate.
   * @param {User} moderator - The admin/moderator performing the action.
   * @param {Exclude<ReviewStatus, "pending">} newStatus - The new status ("approved" or "rejected").
   * @returns {Promise<void>}
   * @throws {AppError} 404 if the review is not found (from this.findById()).
   * @throws {AppError} 409 if the review has already been moderated (status is not 'pending').
   */
  public static async moderate(reviewId: string, moderator: User, newStatus: Exclude<ReviewStatus, "pending">): Promise<void> {
    return await sequelize.transaction(async (t) => {
      const review = await this.findById(reviewId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (review.status !== PENDING) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: REVIEW_ERROR_MESSAGES.MODERATE.ALREADY_MODERATED,
          debugMessage: `Cannot moderate review '${review.id}' because its status is '${review.status}'.`,
        });
      }

      const isApproved = newStatus === APPROVED;
      const targetId = review.target_id;

      if (isApproved) {
        await review.markAsApproved(moderator.id, { transaction: t });

        const result = (await Review.findOne({
          where: {
            target_id: targetId,
            status: APPROVED,
          },
          attributes: [[fn("AVG", col("rating")), "average"]],
          raw: true,
          transaction: t,
        })) as { average: string | number | null } | null;

        const averageRating = result?.average ? Number.parseFloat(Number(result.average).toFixed(1)) : null;

        await User.update({ average_rating: averageRating }, { where: { id: targetId }, transaction: t });
      } else {
        await review.markAsRejected(moderator.id, { transaction: t });
      }
    });
  }
}
