import TimeIllustration from "@/assets/images/time-illustration.svg?react";
import TreeIllustration from "@/assets/images/tree-illustration.svg?react";
import classNames from "classnames";
import { useEffect, useState } from "react";

import Loader from "@/components/Loader/Loader";
import Trip from "@/components/TripCard/TripCard";
import UserService from "@/services/UserService";

import styles from "./UpcomingTripsPage.module.css";

import type { UserUpcomingTrip } from "@/types/UserTypes";

const UpcomingTripsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const [trips, setTrips] = useState<UserUpcomingTrip[]>([]);

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    await fetchUpcomingTrips();
    setIsRetrying(false);
  };

  const fetchUpcomingTrips = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const trips = await UserService.getMyUpcomingTrips();
      setTrips(trips);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
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

  if (error)
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <TreeIllustration className={classNames(styles.errorIllustration)} />
          <p>Une erreur est survenue lors de la récupération des trajets.</p>
          <button onClick={handleRetry} className={styles.retryButton} disabled={isRetrying}>
            {isRetrying ? "Un instant..." : "Réessayer"}
          </button>
        </div>
      </div>
    );
  return (
    <div className={styles.pageContainer}>
      <div className={styles.tripsContainer}>
        {trips.length === 0 ? (
          <div className={styles.noTripsContainer}>
            <TimeIllustration className={styles.emptyIllustration} />
            <p>Vos prochains trajets apparaîtront ici.</p>
          </div>
        ) : (
          trips.map((trip) => <Trip key={trip.id} data={trip} eventType={trip.type} />)
        )}
      </div>
    </div>
  );
};

export default UpcomingTripsPage;
