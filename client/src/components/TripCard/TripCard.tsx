import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import BookingService from "@/services/BookingService";
import RideService from "@/services/RideService";
import { formatDateFr, formatDuration } from "@/utils/dateUtils";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

import styles from "./TripCard.module.css";

import type { Booking } from "@/types/BookingTypes";
import type { Ride } from "@/types/RideTypes";

type ModalType = "cancelRide" | "startRide" | "endRide" | "cancelBooking" | null;

const modalTitles = {
  cancelRide: "Confirmation d'annulation de trajet",
  startRide: "Confirmation de démarrage de trajet",
  endRide: "Confirmation d'arrivée à destination",
  cancelBooking: "Confirmation d'annulation de réservation",
};

const modalMessages = {
  cancelRide: "Souhaitez-vous annuler ce trajet ? Les passagers en seront automatiquement informés.",
  startRide: "Voulez-vous démarrer ce trajet maintenant ?",
  endRide: "Confirmez-vous être arrivé(e) à destination ?",
  cancelBooking: "Souhaitez-vous annuler cette réservation ?",
};

const successMessages = {
  cancelRide: "Le trajet a été annulé avec succès.",
  startRide: "Le trajet a démarré avec succès.",
  endRide: "L'arrivée à destination a été confirmée avec succès.",
  cancelBooking: "La réservation a été annulée avec succès.",
};

interface TripProps {
  data: Ride | Booking;
  eventType: "ride" | "booking";
}

const Trip = ({ data, eventType }: TripProps) => {
  const [canStartRideNow, setCanStartRideNow] = useState<boolean | null>(null);
  const [canEndRideNow, setCanEndRideNow] = useState<boolean | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);

  const isBooking = eventType === "booking";
  const ride: Ride = isBooking ? (data as Booking).ride : (data as Ride);

  const now = dayjs();

  const booking = isBooking ? (data as Booking) : null;

  const isRideCancelled = ride.status === "cancelled";
  const isBookingCancelled = booking?.status === "cancelled";
  const isCancelled = isRideCancelled || isBookingCancelled;

  const isBookingAwaitingFeedback = isBooking && booking?.status === "awaiting_feedback";

  const isRideFinished =
    ride.status === "completed" || (ride.arrivalDate && dayjs(ride.arrivalDate).isBefore(now, "day"));

  const isBookingFinished = booking?.status === "completed";
  const isFinished = isRideFinished || isBookingFinished;

  const isRideInProgress = ride.status === "in_progress";

  const handleConfirm = async () => {
    if (!ride || !modalType) return;

    try {
      switch (modalType) {
        case "cancelRide":
          await RideService.cancelRide(data.id);
          toast.success(successMessages.cancelRide);
          break;
        case "startRide":
          await RideService.startRide(data.id);
          toast.success(successMessages.startRide);
          break;
        case "endRide":
          await RideService.endRide(data.id);
          toast.success(successMessages.endRide);
          break;
        case "cancelBooking":
          await BookingService.cancelBooking(data.id);
          toast.success(successMessages.cancelBooking);
          break;
      }
    } catch {
      toast.error("Oups ! Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setModalType(null);
    }
  };

  useEffect(() => {
    if (!ride || eventType !== "ride") return;

    if (ride.status === "in_progress") {
      setCanEndRideNow(true);
      setCanStartRideNow(false);
    } else {
      // On ne peut démarrer le trajet que si le départ est dans 1h ou moins
      const { departureDate, departureTime } = ride;
      const departure = dayjs(`${departureDate} ${departureTime}`, "DD/MM/YYYY HH:mm");

      const isNear = departure.isBefore(now.add(1, "hour"));

      setCanStartRideNow(isNear);
    }
  }, [ride, eventType, now]);

  return (
    <div className={styles.trip}>
      <div className={styles.tripHeader}>
        <p className={styles.badge}>{isBooking ? "Passager" : "Conducteur"}</p>
        <p className={styles.createdAt}>
          {isBooking
            ? `Fait le ${booking?.createdAt && formatDateFr(booking?.createdAt)}`
            : `Créé le ${ride.createdAt && formatDateFr(ride.createdAt)}`}
        </p>
      </div>

      <div className={styles.tripDetails}>
        <p className={styles.date}> {formatDateFr(ride.departureDate)}</p>
        <div className={styles.moreInfo}>
          <div className={styles.locationTime}>
            <div className={styles.location}>
              <span>{ride.departureLocation}</span>
              <span>{ride.arrivalLocation}</span>
            </div>

            <div className={styles.time}>
              <span>{ride.departureTime}</span>
              <span>{ride.arrivalTime}</span>
            </div>
          </div>

          <div className={styles.duration}>{formatDuration(ride.duration)}</div>
        </div>

        {(isCancelled || isFinished || isBookingAwaitingFeedback || isRideInProgress) && (
          <div className={styles.overlay}>
            <p>
              {isCancelled
                ? "Annulé"
                : isBookingAwaitingFeedback
                ? "Donnez votre avis sur ce trajet"
                : isRideInProgress
                ? "En cours"
                : "Terminé"}
            </p>
          </div>
        )}
      </div>

      {eventType === "ride" ? (
        <div className={styles.buttonsContainer}>
          <Link to={`/ride/${ride.id}/show`} className={styles.seeButton}>
            Voir
          </Link>

          {!isCancelled && !isFinished && (
            <>
              {canStartRideNow ? (
                <button className={styles.startButton} onClick={() => setModalType("startRide")}>
                  Démarrer
                </button>
              ) : canEndRideNow ? (
                <button className={styles.endButton} onClick={() => setModalType("endRide")}>
                  Arriver à destination
                </button>
              ) : (
                <button className={styles.cancelButton} onClick={() => setModalType("cancelRide")}>
                  Annuler
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.buttonsContainer}>
          <Link to={`/ride/${ride.id}/show`} className={styles.seeButton}>
            Voir
          </Link>

          {isBookingAwaitingFeedback ? (
            <Link to={`/ride/${ride.id}/evaluate`} className={styles.evaluateButton}>
              Évaluer
            </Link>
          ) : (
            !isCancelled &&
            !isFinished &&
            !isRideInProgress && (
              <button className={styles.cancelButton} onClick={() => setModalType("cancelBooking")}>
                Annuler
              </button>
            )
          )}
        </div>
      )}

      {modalType && (
        <ConfirmationModal
          title={modalType ? modalTitles[modalType] : ""}
          message={modalType ? modalMessages[modalType] : ""}
          onConfirm={handleConfirm}
          onCancel={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default Trip;
