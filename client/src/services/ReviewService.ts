import { axiosPrivate } from "api/axiosInstance";

import { CreateReviewData } from "@/types/ReviewTypes";

class ReviewService {
  static async createReview(data: CreateReviewData) {
    const url = "/reviews";
    const response = await axiosPrivate.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async getUserReceivedReviews(userId: string) {
    const url = `/reviews/user/${userId}/received`;
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  static async getUserGivenReviews(userId: string) {
    const url = `/reviews/user/${userId}/given`;
    const response = await axiosPrivate.get(url);
    return response.data;
  }
}

export default ReviewService;
