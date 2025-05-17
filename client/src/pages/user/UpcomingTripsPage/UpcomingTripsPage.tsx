import { useEffect, useState } from "react";

import Loader from "@/components/Loader/Loader";
import Trip from "@/components/TripCard/TripCard";
import UserService from "@/services/UserService";

import styles from "./UpcomingTripsPage.module.css";

import type { Booking } from "@/types/BookingTypes";
import type { Ride } from "@/types/RideTypes";

type UpcomingTrip = (Ride | Booking) & { type: "ride" | "booking" };

const UpcomingTripsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trips, setTrips] = useState<UpcomingTrip[]>([]);

  const fetchUpcomingTrips = async () => {
    setIsLoading(true);
    setError(null);
    const start = Date.now();

    try {
      const trips = await UserService.getMyUpcomingEvents();
      setTrips(trips);
    } catch {
      setError("Une erreur est survenue lors du chargement de vos trajets.");
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 300 - elapsed);
      setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    }
  };

  useEffect(() => {
    fetchUpcomingTrips();
  }, []);

  if (isLoading)
    return (
      <div className={styles.pageContainer}>
        <Loader />
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tripsContainer}>
        <h1 className={styles.title}>Mes trajets à venir</h1>

        {error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchUpcomingTrips} className={styles.retryButton}>
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {trips.length === 0 ? (
              <p className={styles.noTripsMessage}>Vos prochains trajets apparaîtront ici.</p>
            ) : (
              trips.map((trip) => <Trip key={trip.id} data={trip} eventType={trip.type} />)
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingTripsPage;
