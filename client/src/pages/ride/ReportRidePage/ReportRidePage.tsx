import { AxiosError } from "axios";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import Loader from "@/components/Loader/Loader";
import useAccount from "@/hooks/useAccount";
import BookingService from "@/services/BookingService";
import RideService from "@/services/RideService";
import { formatFullDateFr } from "@/utils/dateUtils";

import styles from "./ReportRidePage.module.css";

import type { RideDetails } from "@/types/RideTypes";
import type { User } from "@/types/UserTypes";

const ReportRidePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [description, setDescription] = useState<string>("");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account } = useAccount();
  const user = account as User;

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

  const validateForm = (data: { description: string }): boolean => {
    setError({});

    if (!data.description.trim()) {
      setError({ description: "Veuillez fournir une description de l'incident" });
      return false;
    } else if (data.description.length < 10) {
      setError({ description: "Votre description est un peu courte. Minimum 10 caractères." });
      return false;
    } else if (data.description.length > 500) {
      setError({ description: "Votre description est trop longue. Maximum 500 caractères autorisés." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    if (isSubmitting) return;

    e.preventDefault();

    if (!rideDetails || !user) return;

    const cleanedData = {
      description: description.trim(),
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) return;

    if (!id) return;

    setIsSubmitting(true);

    const bookingId = rideDetails.bookings.find((booking) => booking.passenger?.id === user.id)?.id;

    if (!bookingId) {
      navigate("/error");
      return;
    }

    try {
      await BookingService.validateBookingWithIncident(bookingId, cleanedData);
      toast.success(
        "Votre signalement a été soumis avec succès. Notre équipe va l'examiner dans les plus brefs délais."
      );
      navigate(`/ride/${id}/review`);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Une erreur est survenue lors du signalement de l'incident");
      } else {
        toast.error("Une erreur est survenue lors du signalement de l'incident");
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
      <div className={styles.reportContainer}>
        <div className={styles.rideSummary}>
          <h1 className={styles.locationText}>
            {departureLocation} → {arrivalLocation}
          </h1>
          <p className={styles.departureDate}>{formatFullDateFr(departureDate)}</p>
          <p className={styles.timeInfo}>
            {departureTime} → {arrivalTime}
          </p>
        </div>

        <p className={styles.questionText}>Que s'est il passé ?</p>
        <p className={styles.subText}>
          Décrivez précisément l'incident survenu lors du trajet. Notre équipe analysera votre signalement dans les plus
          brefs délais.
        </p>

        <form noValidate className={styles.reportForm} onSubmit={handleSubmit}>
          <div className={styles.descriptionContainer}>
            <label htmlFor="description" className={styles.descriptionLabel}>
              Votre description
            </label>
            <textarea
              id="description"
              className={classNames(styles.descriptionTextarea, {
                [styles.hasError]: error.description,
              })}
              value={description}
              minLength={10}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'incident..."
              aria-invalid={!!error.description}
              aria-describedby={"description-error"}
            />
            {error.description && (
              <p id="description-error" className={styles.descriptionErrorMessage}>
                {error.description}
              </p>
            )}
          </div>

          <div className={styles.buttonsContainer}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Signaler l'incident"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(`/ride/${id}/evaluate`)}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportRidePage;
