import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ArrowIcon from "@/assets/images/arrow-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import RatingsIllustration from "@/assets/images/ratings-illustration.svg?react";
import StarIcon from "@/assets/images/star-icon.svg?react";

import Loader from "@/components/Loader/Loader";
import useUser from "@/hooks/useUser";
import { formatMediumDateFr } from "@/utils/dateUtils";

import styles from "./ReceivedRatingsPage.module.css";

import UserService from "@/services/UserService";
import type { ReceivedReview } from "@/types/ReviewTypes";

const ReceivedRatingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchUserReceivedReviews = async (): Promise<void> => {
      if (!user) return;

      try {
        const response = await UserService.getMyReceivedReviews();
        setReviews(response);
      } catch {
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReceivedReviews();
  }, [user, navigate]);

  if (isLoading) return <Loader />;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.reviewsContainer}>
        {reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <RatingsIllustration className={styles.ratingsIllustration} />
            <p>Vous n'avez pas encore reçu d'avis</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ReceivedRatingsPage;
