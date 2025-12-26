import { col, fn } from "sequelize";

import { sequelize } from "@/config";
import { BOOKING_STATUSES, COMMON_ERROR_MESSAGES, REVIEW_ERROR_MESSAGES, REVIEW_STATUSES } from "@/constants";
import { Review, User } from "@/models";
import { TripService } from "@/services";
import { AppError } from "@/utils";

import type {
  CreateReviewPayload,
  GetReviewsFilters,
  GetReviewsSortOptions,
  ReviewDBFilter,
  ReviewStatus,
} from "@/types";
import type { FindOptions, Order, WhereOptions } from "sequelize";

const { APPROVED } = REVIEW_STATUSES;

export class ReviewService {
  /**
   * Finds a review by ID.
   *
   * @param {string} reviewId - The ID of the review.
   * @param {FindOptions} [options] - Additional Sequelize find options.
   * @returns {Promise<IncidentDocument>} - The returned review instance.
   * @throws {AppError} - If:
   *   - The review is not found (HTTP 404).
   */
  public static async findById(reviewId: string, options?: FindOptions): Promise<Review> {
    const review = await Review.findByPk(reviewId, options);

    if (!review) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[ReviewService.findById] Review '${reviewId}' not found in database.`,
      });
    }

    return review;
  }

  /**
   * Retrieves all reviews with pagination, optional filters, and sorting.
   *
   * @param {number} limit - The maximum number of reviews to return.
   * @param {number} offset - The number of reviews to skip (for pagination).
   * @param {GetReviewsFilters} [filters] - Optional filters (status, targetId, authorId).
   * @param {GetReviewsSortOptions} [sortOptions] - Optional sort options (by: "createdAt" | "rating", dir: "asc" | "desc").
   * @returns {Promise<{ count: number; reviews: Review[] }>} - An object containing the total count and the list of reviews.
   */
  public static async findAll(
    limit: number,
    offset: number,
    filters?: GetReviewsFilters,
    sortOptions?: GetReviewsSortOptions,
    options?: { include?: FindOptions["include"] }
  ): Promise<{ count: number; reviews: Review[] }> {
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

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: options?.include,
      distinct: true,
    });

    return { count, reviews };
  }

  /**
   * Creates a new review for a completed trip.
   *
   * @param {User} user - The user creating the review.
   * @param {CreateReviewPayload} data - The review data (tripId, rating, comment).
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The trip is not found (HTTP 404, thrown by TripService.findById).
   *   - The user is the driver of the trip (HTTP 403).
   *   - The trip is not completed (HTTP 409).
   *   - The user has no completed booking for the trip (HTTP 403).
   *   - The user has already reviewed the trip (HTTP 409).
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
        lock: true,
        transaction: t,
      });

      if (trip.driver_id === user.id) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.IS_DRIVER,
          debugMessage: `[ReviewService.create] Cannot create review: User '${user.id}' is the driver of trip '${tripId}'.`,
        });
      }

      if (!trip.isCompleted()) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.TRIP_NOT_COMPLETED,
          debugMessage: `[ReviewService.create] Cannot create review: Trip '${tripId}' is not completed (current status: '${trip.status}').`,
        });
      }

      const hasCompletedBooking = trip.bookings && trip.bookings.length > 0;

      if (!hasCompletedBooking) {
        throw new AppError({
          statusCode: 403,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.BOOKING_NOT_COMPLETED,
          debugMessage: `[ReviewService.create] Cannot create review: User '${user.id}' has no completed booking for trip '${tripId}'.`,
        });
      }

      const existingReview = !!(await Review.count({
        where: { trip_id: tripId, author_id: user.id },
      }));

      if (existingReview) {
        throw new AppError({
          statusCode: 409,
          userMessageKey: REVIEW_ERROR_MESSAGES.CREATE.ALREADY_REVIEWED,
          debugMessage: `[ReviewService.create] Cannot create review: User '${user.id}' has already reviewed trip '${tripId}'.`,
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
   * @param {Exclude<ReviewStatus, "pending">} status - The new status ("approved" or "rejected").
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - The review is not found (HTTP 404).
   */
  public static async moderate(reviewId: string, moderator: User, status: Exclude<ReviewStatus, "pending">) {
    const review = await this.findById(reviewId);
    const isApproved = status === APPROVED;
    const targetId = review.target_id;

    return await sequelize.transaction(async (t) => {
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
