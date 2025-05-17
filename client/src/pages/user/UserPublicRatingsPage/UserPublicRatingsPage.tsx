import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ArrowIcon from "@/assets/images/arrow-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import RatingsIllustration from "@/assets/images/ratings-illustration.svg?react";
import StarIcon from "@/assets/images/star-icon.svg?react";

import Loader from "@/components/Loader/Loader";
import ReviewService from "@/services/ReviewService";
import { formatMediumDateFr } from "@/utils/dateUtils";

import styles from "./UserPublicRatingsPage.module.css";

import type { ReceivedReview } from "@/types/ReviewTypes";

const UserPublicRatingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);

  const { id: userId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserReceivedReviews = async (): Promise<void> => {
      if (!userId) return;

      try {
        const response = await ReviewService.getUserReceivedReviews(userId);
        setReviews(response.data);
        setTotalReviews(response.pagination.total);
      } catch {
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReceivedReviews();
  }, [userId, navigate]);

  if (isLoading) return <Loader />;

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.reviewsContainer}>
        <h1 className={styles.title}>Avis</h1>

        {reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <RatingsIllustration className={styles.ratingsIllustration} />
            <p>L'utilisateur n'a pas encore reçu d'avis </p>
          </div>
        ) : (
          <>
            <div className={styles.ratingOverview}>
              <p className={styles.averageRating}>{averageRating}/5</p>
              <p className={styles.ratingCount}>{totalReviews > 0 ? `${totalReviews} avis` : "Aucun avis"}</p>
            </div>

            <div className={styles.reviewsList}>
              {reviews.map((review) => {
                const { id: reviewId, author, rating, comment, createdAt } = review;
                const { id: userId, firstName, pseudo, avatar } = author || {};

                return (
                  <div key={reviewId} className={styles.reviewItem}>
                    <Link to={`/user/${userId}/show`} className={styles.reviewHeader}>
                      <div className={styles.authorInfo}>
                        <div className={styles.avatarWrapper}>
                          {avatar ? (
                            <img src={avatar} alt="Avatar" className={styles.avatarImage} />
                          ) : (
                            <img src={DefaultAvatar} alt="Avatar" className={styles.avatarImage} />
                          )}
                        </div>
                        <div className={styles.authorDetails}>
                          <p className={styles.authorName}>{firstName}</p>
                          <p className={styles.authorPseudo}>@{pseudo}</p>
                        </div>
                      </div>

                      <ArrowIcon className={styles.arrowIcon} />
                    </Link>

                    <div className={styles.reviewContent}>
                      <div className={styles.ratingContainer}>
                        <StarIcon className={styles.starIcon} />
                        <span className={styles.ratingScore}>{rating}/5</span>
                      </div>
                      <p className={styles.reviewComment}>{comment}</p>
                      <p className={styles.reviewDate}>{formatMediumDateFr(createdAt.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPublicRatingsPage;
