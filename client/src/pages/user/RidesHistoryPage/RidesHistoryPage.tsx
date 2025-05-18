import { useEffect, useState } from "react";

import CarIllustration from "@/assets/images/car-illustration.svg?react";
import TreeIllustration from "@/assets/images/tree-illustration.svg?react";

import Loader from "@/components/Loader/Loader";
import TripCard from "@/components/TripCard/TripCard";
import UserService from "@/services/UserService";

import styles from "./RidesHistoryPage.module.css";

import type { Ride } from "@/types/RideTypes";

const RidesHistoryPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [rides, setRides] = useState<Ride[]>([]);

  const fetchRides = async (): Promise<void> => {
    setIsLoading(true);
    setError(false);

    try {
      const rides = await UserService.getMyRidesHistory();
      setRides(rides);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  if (isLoading)
    return (
      <div className={styles.pageContainer}>
        <Loader />
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      {error ? (
        <div className={styles.errorContainer}>
          <TreeIllustration className={styles.illustration} />
          <p>Une erreur est survenue lors de la récupération de vos trajets.</p>
          <button onClick={fetchRides} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {rides.length === 0 ? (
            <div className={styles.noRidesContainer}>
              <CarIllustration className={styles.illustration} />
              <p>Vous n'avez pas encore publié de trajet.</p>
            </div>
          ) : (
            <div className={styles.rideList}>
              {rides.map((ride) => (
                <TripCard key={ride.id} data={ride} eventType="ride" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default RidesHistoryPage;
