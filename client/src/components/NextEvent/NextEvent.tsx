import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

dayjs.extend(customParseFormat);

import Loader from "@/components/Loader/Loader";
import BookingService from "@/services/BookingService";
import RideService from "@/services/RideService";
import UserService from "@/services/UserService";
import { formatDuration } from "@/utils/dateUtils";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

import styles from "./NextEvent.module.css";

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
  endRide: "L’arrivée à destination a été confirmée avec succès.",
  cancelBooking: "La réservation a été annulée avec succès.",
};

const NextEvent = () => {
  const [nextEvent, setNextEvent] = useState<Ride | Booking | null>(null);
  const [eventType, setEventType] = useState<"ride" | "booking" | null>(null);
  const [canStartRideNow, setCanStartRideNow] = useState<boolean | null>(null);
  const [canEndRideNow, setCanEndRideNow] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);

  const handleConfirm = async () => {
    if (!nextEvent || !modalType) return;

    try {
      switch (modalType) {
        case "cancelRide":
          await RideService.cancelRide(nextEvent.id);
          toast.success(successMessages.cancelRide);
          setNextEvent(null);
          setEventType(null);
          break;
        case "startRide":
          await RideService.startRide(nextEvent.id);
          toast.success(successMessages.startRide);
          break;
        case "endRide":
          await RideService.endRide(nextEvent.id);
          toast.success(successMessages.endRide);
          break;
        case "cancelBooking":
          await BookingService.cancelBooking(nextEvent.id);
          toast.success(successMessages.cancelBooking);
          setNextEvent(null);
          setEventType(null);
          break;
      }
    } catch {
      toast.error("Oups ! Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setModalType(null);
    }
  };

  useEffect(() => {
    const fetchNextEvent = async () => {
      const response = await UserService.getMyNextEvent();

      if (response) {
        console.log(response);
        setEventType(response.type);
        setNextEvent(response.data);
      } else {
        setNextEvent(null);
        setEventType(null);
      }

      setIsLoading(false);
    };

    fetchNextEvent();
  }, []);

  useEffect(() => {
    if (!nextEvent || eventType !== "ride") return;

    const ride = nextEvent as Ride;

    if (ride.status === "in_progress") {
      setCanEndRideNow(true);
      setCanStartRideNow(false);
    } else {
      // On ne peut démarrer le trajet à partir de 1h avant le départ
      const { departureDate, departureTime } = ride;
      const departure = dayjs(`${departureDate} ${departureTime}`, "DD/MM/YYYY HH:mm");
      const now = dayjs();
      const isNear = departure.isBefore(now.add(1, "hour"));

      setCanStartRideNow(isNear);
    }
  }, [nextEvent, eventType]);

  if (isLoading) return <Loader />;

  if (!nextEvent) return null;

  let dataToDisplay: Ride | Booking | null = null;

  if (eventType === "ride") {
    dataToDisplay = nextEvent as Ride;
  } else {
    dataToDisplay = (nextEvent as Booking).ride;
  }

  return (
    <div className={styles.nextEvent}>
      <p className={styles.nextEventText}>Votre prochain voyage</p>
      <p className={styles.nextEventDate}>le {dayjs(dataToDisplay.departureDate).format("DD/MM/YYYY")}</p>
      <div className={styles.eventDetails}>
        <div className={styles.locationTime}>
          <div className={styles.from}>
            <span className={styles.city}>{dataToDisplay.departureLocation}</span>
            <span className={styles.time}>{dataToDisplay.departureTime}</span>
          </div>

          <div className={styles.to}>
            <span className={styles.city}>{dataToDisplay.arrivalLocation}</span>
            <span className={styles.time}>{dataToDisplay.arrivalTime}</span>
          </div>
        </div>

        <div className={styles.duration}>{formatDuration(dataToDisplay.duration)}</div>
      </div>

      {eventType === "ride" ? (
        <div className={styles.buttons}>
          <Link to={`/ride/show/${nextEvent.id}`} className={styles.seeButton}>
            Voir
          </Link>

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
        </div>
      ) : (
        <div className={styles.buttons}>
          <Link to={`/ride/show/${nextEvent.id}`} className={styles.seeButton}>
            Voir
          </Link>

          <button className={styles.cancelButton} onClick={() => setModalType("cancelBooking")}>
            Annuler
          </button>
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

export default NextEvent;
