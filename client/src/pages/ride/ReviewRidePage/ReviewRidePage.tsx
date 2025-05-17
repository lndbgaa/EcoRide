import { AxiosError } from "axios";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import Loader from "@/components/Loader/Loader";
import useUser from "@/hooks/useUser";
import RideService from "@/services/RideService";
import { formatFullDateFr } from "@/utils/dateUtils";

import styles from "./ReviewRidePage.module.css";

import ReviewService from "@/services/ReviewService";
import type { RideDetails } from "@/types/RideTypes";

const ReviewRidePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchRideDetails = async (): Promise<void> => {
      if (!id || !validator.isUUID(id)) {
        navigate("/error");
        return;
      }

      try {
        const response = await RideService.getRideDetails(id);
        setRideDetails(response.data);
      } catch {
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (!rideDetails || !user) return;

    const isPassenger = rideDetails.bookings.some((booking) => booking.passenger?.id === user.id);

    if (!isPassenger) {
      navigate("/unauthorized");
    }
  }, [rideDetails, navigate, user]);

  const validateForm = (data: { rating: number; comment: string }): boolean => {
    setError({});

    if (data.rating === 0) {
      setError({ rating: "Veuillez attribuer une note" });
      return false;
    }

    if (!data.comment.trim()) {
      setError({ comment: "Veuillez laisser un commentaire" });
      return false;
    } else if (data.comment.length < 10) {
      setError({ comment: "Votre commentaire est un peu court. Minimum 10 caractères." });
      return false;
    } else if (data.comment.length > 255) {
      setError({ comment: "Votre commentaire est trop long. Maximum 255 caractères autorisés." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    if (isSubmitting) return;

    e.preventDefault();

    const cleanedData = {
      rating: rating,
      comment: comment.trim(),
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) return;

    if (!id) return;

    setIsSubmitting(true);

    try {
      await ReviewService.createReview({ ...cleanedData, rideId: id });
      toast.success("Votre avis a été soumis avec succès. Il sera publié après validation par notre équipe.");
      navigate("/dashboard/history/bookings");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Une erreur est survenue lors de la soumissions de votre avis");
      } else {
        toast.error("Une erreur est survenue lors de la soumission de votre avis");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  if (!rideDetails) return null;

  const { ride } = rideDetails;
  const { departureLocation, arrivalLocation, departureDate, departureTime, arrivalTime, driver } = ride;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.reviewContainer}>
        <div className={styles.rideSummary}>
          <p className={styles.locationText}>
            {departureLocation} → {arrivalLocation}
          </p>
          <p className={styles.departureDate}>{formatFullDateFr(departureDate)}</p>
          <p className={styles.timeInfo}>
            {departureTime} → {arrivalTime}
          </p>
        </div>

        <form className={styles.reviewForm} onSubmit={handleSubmit}>
          <div className={styles.ratingContainer}>
            <p className={styles.ratingLabel}>
              Comment évaluer-vous votre trajet avec <span className={styles.driverName}>{driver.firstName}</span> ?
            </p>
            <div className={styles.rating}>
              <input
                value="5"
                name="rating"
                id="star5"
                type="radio"
                checked={rating === 5}
                onChange={() => setRating(5)}
              />
              <label htmlFor="star5"></label>
              <input
                value="4"
                name="rating"
                id="star4"
                type="radio"
                checked={rating === 4}
                onChange={() => setRating(4)}
              />
              <label htmlFor="star4"></label>
              <input
                value="3"
                name="rating"
                id="star3"
                type="radio"
                checked={rating === 3}
                onChange={() => setRating(3)}
              />
              <label htmlFor="star3"></label>
              <input
                value="2"
                name="rating"
                id="star2"
                type="radio"
                checked={rating === 2}
                onChange={() => setRating(2)}
              />
              <label htmlFor="star2"></label>
              <input
                value="1"
                name="rating"
                id="star1"
                type="radio"
                checked={rating === 1}
                onChange={() => setRating(1)}
              />
              <label htmlFor="star1"></label>
            </div>
            {error.rating && <p className={styles.ratingErrorMessage}>{error.rating}</p>}
          </div>

          <div className={styles.commentContainer}>
            <label htmlFor="comment" className={styles.commentLabel}>
              Votre commentaire
            </label>
            <textarea
              id="comment"
              className={classNames(styles.commentTextarea, {
                [styles.hasError]: error.comment,
              })}
              value={comment}
              minLength={10}
              maxLength={255}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
            />
            {error.comment && <p className={styles.commentErrorMessage}>{error.comment}</p>}
          </div>

          <div className={styles.buttonsContainer}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer mon avis"}
            </button>
            <button
              type="button"
              className={styles.skipButton}
              onClick={() => navigate("/dashboard/history/bookings")}
              disabled={isSubmitting}
            >
              Passer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewRidePage;
