import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TimeIllustration from "@/assets/images/time-illustration.svg?react";

import Loader from "@/components/Loader/Loader";
import Trip from "@/components/TripCard/TripCard";
import UserService from "@/services/UserService";

import styles from "./UpcomingTripsPage.module.css";

import type { Booking } from "@/types/BookingTypes";
import type { Ride } from "@/types/RideTypes";

type UpcomingTrip = (Ride | Booking) & { type: "ride" | "booking" };

const UpcomingTripsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const [trips, setTrips] = useState<UpcomingTrip[]>([]);

  const navigate = useNavigate();

  const fetchUpcomingTrips = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const trips = await UserService.getMyUpcomingEvents();
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

  if (error) return navigate("/error");

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tripsContainer}>
        {trips.length === 0 ? (
          <div className={styles.noTripsContainer}>
            <TimeIllustration className={styles.illustration} />
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
