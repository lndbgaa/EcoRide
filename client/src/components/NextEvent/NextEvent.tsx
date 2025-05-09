import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

dayjs.extend(customParseFormat);

import BookingService from "@/services/BookingService";
import RideService from "@/services/RideService";
import { Booking } from "@/types/BookingTypes";
import { Ride } from "@/types/RideTypes";
import { formatDuration } from "@/utils/dateUtils";
import Loader from "../Loader/Loader";

import styles from "./NextEvent.module.css";

const NextEvent = () => {
  const [nextEvent, setNextEvent] = useState<Ride | Booking | null>(null);
  const [eventType, setEventType] = useState<"ride" | "booking" | null>(null);
  const [canStartRideNow, setCanStartRideNow] = useState<boolean | null>(null);
  const [canEndRideNow, setCanEndRideNow] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false); // TODO: remettre a true si on veut afficher le loader

  const handleCancelRide = async () => {
    if (!nextEvent) return;
    if (!window.confirm("Êtes-vous sûr(e) de vouloir annuler ce trajet ?")) return; // TODO: ajouter un modal de confirmation
    await RideService.cancelRide(nextEvent.id);
  };

  const handleStartRide = async () => {
    if (!nextEvent) return;
    if (!window.confirm("Êtes-vous sûr(e) de vouloir démarrer ce trajet ?")) return; // TODO: ajouter un modal de confirmation
    await RideService.startRide(nextEvent.id);
  };

  const handleEndRide = async () => {
    if (!nextEvent) return;
    if (!window.confirm("Êtes-vous sûr(e) de vouloir clôturer ce trajet ?")) return; // TODO: ajouter un modal de confirmation
    await RideService.endRide(nextEvent.id);
  };

  const handleCancelBooking = async () => {
    if (!nextEvent) return;
    if (!window.confirm("Êtes-vous sûr(e) de vouloir annuler cette réservation ?")) return; // TODO: ajouter un modal de confirmation
    await BookingService.cancelBooking(nextEvent.id);
  };

  /*useEffect(() => {
    const fetchNextEvent = async () => {
      const response = await UserService.getUserNextEvent();

      if (response) {
        setEventType(response.type);
        setNextEvent(response.data);
      } else {
        setNextEvent(null);
        setEventType(null);
      }

      setIsLoading(false);
    };

    fetchNextEvent();
  }, []); */

  useEffect(() => {
    if (!nextEvent || eventType !== "ride") return;

    const ride = nextEvent as Ride;

    if (ride.status === "in_progress") {
      setCanEndRideNow(true);
      setCanStartRideNow(false);
    } else {
      // On ne peut démarrer le trajet à partir de 1h avant le départ
      const { departure_date, departure_time } = ride;
      const departure = dayjs(`${departure_date} ${departure_time}`, "DD/MM/YYYY HH:mm");
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
      <p className={styles.nextEventDate}>le {dataToDisplay.departure_date}</p>
      <div className={styles.eventDetails}>
        <div className={styles.locationTime}>
          <div className={styles.from}>
            <span className={styles.city}>{dataToDisplay.departure_location}</span>
            <span className={styles.time}>{dataToDisplay.departure_time}</span>
          </div>

          <div className={styles.to}>
            <span className={styles.city}>{dataToDisplay.arrival_location}</span>
            <span className={styles.time}>{dataToDisplay.arrival_time}</span>
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
            <button className={styles.startButton} onClick={handleStartRide}>
              Démarrer
            </button>
          ) : canEndRideNow ? (
            <button className={styles.endButton} onClick={handleEndRide}>
              Arriver à destination
            </button>
          ) : (
            <button className={styles.cancelButton} onClick={handleCancelRide}>
              Annuler
            </button>
          )}
        </div>
      ) : (
        <div className={styles.buttons}>
          <Link to={`/ride/show/${nextEvent.id}`} className={styles.seeButton}>
            Voir
          </Link>

          <button className={styles.cancelButton} onClick={handleCancelBooking}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );
};

export default NextEvent;
