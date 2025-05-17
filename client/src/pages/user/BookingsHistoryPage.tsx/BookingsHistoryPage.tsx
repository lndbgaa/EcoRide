import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "@/components/Loader/Loader";
import TripCard from "@/components/TripCard/TripCard";
import UserService from "@/services/UserService";

import styles from "./BookingsHistoryPage.module.css";

import type { Booking } from "@/types/BookingTypes";

const BookingsHistoryPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const bookings = await UserService.getMyBookingsHistory();
      setBookings(bookings);
    } catch {
      setError("Une erreur est survenue lors de la récupération de vos réservations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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
          <p>{error}</p>
          <button onClick={fetchBookings} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {bookings.length === 0 ? (
            <div className={styles.noBookingsContainer}>
              <p>Vous n'avez pas encore réservé de trajet.</p>
              <Link to="/search">Rechercher un trajet</Link>
            </div>
          ) : (
            <div className={styles.bookingList}>
              {bookings.map((booking) => (
                <TripCard key={booking.id} data={booking} eventType="booking" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default BookingsHistoryPage;
