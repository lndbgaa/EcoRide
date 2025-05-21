import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import AvatarIcon from "@/assets/images/avatar-icon.svg?react";
import CarIcon from "@/assets/images/car-icon.svg?react";
import CheckIcon from "@/assets/images/check-icon.svg?react";
import CrossIcon from "@/assets/images/cross-icon.svg?react";
import EmptyIllustration from "@/assets/images/empty-illustration.svg?react";
import TreeIllustration from "@/assets/images/tree-illustration.svg?react";

import Loader from "@/components/Loader/Loader";
import ReviewService from "@/services/ReviewService";
import { formatDateFr } from "@/utils/dateUtils";

import styles from "./ManageReviewsPage.module.css";

import type { ReviewToModerate } from "@/types/ReviewTypes";

const ManageReviewsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const [pendingReviews, setPendingReviews] = useState<ReviewToModerate[]>([]);
  const [totalPendingReviews, setTotalPendingReviews] = useState<number>(0);

  const fetchPendingReviews = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const response = await ReviewService.getPendingReviews();
      setPendingReviews(response.data);
      setTotalPendingReviews(response.pagination.total);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleApprove = async (reviewId: string) => {
    await ReviewService.approveReview(reviewId);
    setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setTotalPendingReviews((prev) => prev - 1);
    toast.success("Avis approuvé avec succès");
  };

  const handleReject = async (reviewId: string) => {
    await ReviewService.rejectReview(reviewId);
    setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setTotalPendingReviews((prev) => prev - 1);
    toast.success("Avis refusé avec succès");
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <TreeIllustration className={styles.illustration} />
          <p className={styles.error}>Erreur lors du chargement des avis.</p>
          <button onClick={fetchPendingReviews} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {pendingReviews.length === 0 ? (
        <div className={styles.noReviewsContainer}>
          <EmptyIllustration className={styles.illustration} />
          <p>Aucun avis en attente de modération.</p>
        </div>
      ) : (
        <div className={styles.reviewsContainer}>
          <p className={styles.totalCount}>
            <span>{totalPendingReviews}</span>
            <span>avis en attente de modération</span>
          </p>

          <div className={styles.reviewsList}>
            {pendingReviews.map((review) => {
              const { id: reviewId, author, target, rating, comment, createdAt } = review;

              return (
                <div key={reviewId} className={styles.reviewCard}>
                  <p className={styles.reviewDate}>le {formatDateFr(createdAt.date)}</p>
                  <p className={styles.reviewComment}>« {comment} »</p>
                  <div className={styles.divider}></div>
                  <div className={styles.reviewMeta}>
                    {/* Auteur */}
                    <div className={styles.authorInfo}>
                      <AvatarIcon className={styles.avatarIcon} />
                      <p className={styles.pseudo}>{author?.pseudo}</p>
                    </div>

                    {/* Cible */}
                    <div className={styles.targetInfo}>
                      <CarIcon className={styles.carIcon} />
                      <p className={styles.pseudo}>{target?.pseudo}</p>
                    </div>

                    <p className={styles.rating}>
                      Note: <span>{rating}/5</span>
                    </p>
                  </div>
                  <div className={styles.actionButtons}>
                    <button className={styles.approveBtn} onClick={() => handleApprove(reviewId)}>
                      <CheckIcon className={styles.checkIcon} />
                    </button>
                    <button className={styles.rejectBtn} onClick={() => handleReject(reviewId)}>
                      <CrossIcon className={styles.crossIcon} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviewsPage;
