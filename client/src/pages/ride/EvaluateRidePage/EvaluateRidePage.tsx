import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import Loader from "@/components/Loader/Loader";
import useUser from "@/hooks/useUser";
import BookingService from "@/services/BookingService";
import RideService from "@/services/RideService";
import { formatFullDateFr } from "@/utils/dateUtils";

import styles from "./EvaluateRidePage.module.css";

import type { RideDetails } from "@/types/RideTypes";

const EvaluateRidePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);

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

    const canEvaluate = rideDetails.bookings.some(
      (booking) => booking.passenger?.id === user.id && booking.status === "awaiting_feedback"
    );

    const hasAlreadyEvaluated = rideDetails.bookings.some(
      (booking) => booking.passenger?.id === user.id && booking.status === "completed"
    );

    if (!canEvaluate || hasAlreadyEvaluated) {
      navigate("/error");
    }
  }, [rideDetails, navigate, user]);

  const handlePositiveEvaluation = async (): Promise<void> => {
    if (isSubmitting) return;

    if (!rideDetails || !user) return;

    setIsSubmitting(true);

    const bookingId = rideDetails.bookings.find((booking) => booking.passenger?.id === user.id)?.id;

    if (!bookingId) {
      navigate("/error");
      return;
    }

    try {
      await BookingService.validateBooking(bookingId);
      toast.success("Le trajet a été validé  avec succès");
      navigate(`/ride/${id}/review`);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Une erreur est survenue lors de la validation du trajet");
      } else {
        toast.error("Une erreur est survenue lors de la validation du trajet");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  if (!rideDetails) return null;

  const { ride } = rideDetails;
  const { departureLocation, arrivalLocation, departureDate, departureTime, arrivalTime } = ride;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.evaluateContainer}>
        <div className={styles.rideSummary}>
          <p className={styles.locationText}>
            {departureLocation} → {arrivalLocation}
          </p>
          <p className={styles.departureDate}>{formatFullDateFr(departureDate)}</p>
          <p className={styles.timeInfo}>
            {departureTime} → {arrivalTime}
          </p>
        </div>

        <div>
          <p className={styles.evaluationQuestion}>Votre trajet s'est-il bien déroulé ?</p>

          <div className={styles.buttonsContainer}>
            <button
              className={`${styles.evaluateButton} ${styles.positiveButton}`}
              onClick={handlePositiveEvaluation}
              disabled={isSubmitting}
            >
              👍 Tout s'est bien déroulé
            </button>
            <button
              className={`${styles.evaluateButton} ${styles.negativeButton}`}
              onClick={() => navigate(`/ride/${id}/report`)}
              disabled={isSubmitting}
            >
              👎 J'ai rencontré un problème
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluateRidePage;
