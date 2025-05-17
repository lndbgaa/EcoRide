import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "@/components/Loader/Loader";
import TripCard from "@/components/TripCard/TripCard";
import UserService from "@/services/UserService";

import styles from "./RidesHistoryPage.module.css";

import type { Ride } from "@/types/RideTypes";

const RidesHistoryPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [rides, setRides] = useState<Ride[]>([]);

  const fetchRides = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rides = await UserService.getMyRidesHistory();
      setRides(rides);
    } catch {
      setError("Une erreur est survenue lors de la récupération de vos trajets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className={styles.pageContainer}>
      {error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchRides} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {rides.length === 0 ? (
            <div className={styles.noRidesContainer}>
              <p>Vous n'avez pas encore publié de trajet</p>
              <Link to="/ride/publish">Publier un trajet</Link>
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
