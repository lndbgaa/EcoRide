import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ArrowIcon from "@/assets/images/arrow-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import RatingsIllustration from "@/assets/images/ratings-illustration.svg?react";
import StarIcon from "@/assets/images/star-icon.svg?react";
import TreeIllustration from "@/assets/images/tree-illustration.svg?react";

import Loader from "@/components/Loader/Loader";
import UserService from "@/services/UserService";
import { formatMediumDateFr } from "@/utils/dateUtils";

import styles from "./GivenRatingsPage.module.css";

import type { WrittenReview } from "@/types/ReviewTypes";

const GivenRatingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [reviews, setReviews] = useState<WrittenReview[]>([]);

  const fetchUserGivenReviews = async (): Promise<void> => {
    setIsLoading(true);
    setError(false);

    try {
      const response = await UserService.getMyWrittenReviews();
      setReviews(response);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGivenReviews();
  }, []);

  if (isLoading)
    return (
      <div className={styles.pageContainer}>
        <Loader />
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      {error ? (
        <div className={styles.errorContainer}>
          <TreeIllustration className={styles.illustration} />
          <p>Une erreur est survenue lors de la récupération de vos avis.</p>
          <button onClick={fetchUserGivenReviews} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {reviews.length === 0 ? (
            <div className={styles.noReviewsContainer}>
              <RatingsIllustration className={styles.illustration} />
              <p>Vous n'avez pas encore laissé d'avis.</p>
            </div>
          ) : (
            <div className={styles.reviewsList}>
              {reviews.map((review) => {
                const { id: reviewId, target, rating, comment, createdAt } = review;
                const { id: userId, firstName, pseudo, avatar } = target || {};

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
          )}
        </>
      )}
    </div>
  );
};

export default GivenRatingsPage;
