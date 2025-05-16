import { AxiosError } from "axios";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import RightArrow from "@/assets/images/arrow-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import StarIcon from "@/assets/images/star-icon.svg?react";

import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import Loader from "@/components/Loader/Loader";
import useUser from "@/hooks/useUser";
import BookingService from "@/services/BookingService";
import RideService from "@/services/RideService";
import { formatDuration, formatFullDateFr } from "@/utils/dateUtils";

import styles from "./RidePublicInfoPage.module.css";

import type { RideDetails } from "@/types/RideTypes";

const RidePublicInfoPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);

  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

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

  const handleBookRide = async (): Promise<void> => {
    if (!id || !user) return;

    setIsBooking(true);

    try {
      await BookingService.createBooking({ rideId: id, seats: 1 });
      toast.success("Votre réservation a été effectuée avec succès");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message ?? "Une erreur est survenue lors de la réservation");
      } else {
        toast.error("Une erreur est survenue lors de la réservation");
      }
    } finally {
      setIsBooking(false);
      setShowModal(false);
    }
  };

  const canBookRide = (): boolean => {
    if (!rideDetails || !user) return false;

    const { ride } = rideDetails;

    const departure = dayjs(`${ride.departureDate} ${ride.departureTime}`, "YYYY-MM-DD HH:mm", true);

    const noSeats = ride.availableSeats <= 0;
    const insufficientCredits = user.credits < ride.price;
    const isDriver = ride.driver.id === user.id;
    const isInPast = departure.isBefore(dayjs());

    if (noSeats || insufficientCredits || isDriver || isInPast) {
      return false;
    }

    return true;
  };

  const getUnavailabilityReason = (): string | null => {
    if (!rideDetails || !user) return null;

    const { ride } = rideDetails;

    const departure = dayjs(`${ride.departureDate} ${ride.departureTime}`, "YYYY-MM-DD HH:mm", true);

    if (ride.driver.id === user.id) return "Vous êtes le conducteur de ce covoiturage";
    if (departure.isBefore(dayjs())) return "Ce covoiturage a déjà eu lieu";
    if (ride.availableSeats <= 0) return "Il n'y a plus de places disponibles";
    if (user.credits < ride.price) return "Vos fonds sont insuffisants";

    return null;
  };

  if (isLoading) return <Loader />;

  if (!rideDetails) return null;

  const { ride, preferences, passengers } = rideDetails;
  const {
    departureLocation,
    arrivalLocation,
    departureDate,
    departureTime,
    arrivalTime,
    duration,
    price,
    availableSeats,
    offeredSeats,
    driver,
    vehicle,
    isEcoFriendly,
  } = ride;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.rideContainer}>
        <div className={styles.rideSummary}>
          <h1 className={styles.locationText}>
            {departureLocation} → {arrivalLocation}
          </h1>
          <p className={styles.departureDate}>{formatFullDateFr(departureDate)}</p>
        </div>

        <div className={styles.rideDetails}>
          <div className={styles.tripInfo}>
            <div className={styles.locationDetails}>
              {/* Départ */}
              <div className={styles.fromInfo}>
                <p className={styles.tripInfoLabel}>Départ</p>
                <p className={styles.locationName}>{departureLocation}</p>
                <p className={styles.timeInfo}>{departureTime}</p>
              </div>

              {/* Arrivée */}
              <div className={styles.toInfo}>
                <p className={styles.tripInfoLabel}>Arrivée</p>
                <p className={styles.locationName}>{arrivalLocation}</p>
                <p className={styles.timeInfo}>{arrivalTime}</p>
              </div>
            </div>

            {/* Véhicule */}
            <div className={styles.vehicleInfo}>
              <p className={styles.tripInfoLabel}>Véhicule</p>
              <p className={styles.vehicleDetails}>
                {vehicle.brand} {vehicle.model}
              </p>
              <p className={styles.vehicleColor}>{vehicle.color}</p>
            </div>
          </div>

          <div className={styles.bookingCard}>
            <p className={styles.price}>
              {price} <span className={styles.priceLabel}>Crédits</span>
            </p>

            <div className={styles.bookingInfoList}>
              <div className={styles.bookingInfoItem}>
                <span className={styles.bookingInfoLabel}>Places disponibles</span>
                <span className={styles.bookingInfoValue}>
                  {availableSeats} / {offeredSeats}
                </span>
              </div>
              <div className={styles.bookingInfoItem}>
                <span className={styles.bookingInfoLabel}>Durée</span>
                <span className={styles.bookingInfoValue}>{formatDuration(duration)}</span>
              </div>
              <div className={styles.bookingInfoItem}>
                <span className={styles.bookingInfoLabel}>Éco-responsable</span>
                <span className={`${styles.bookingInfoValue} ${isEcoFriendly ? styles.eco : ""}`}>
                  {isEcoFriendly ? "Oui" : "Non"}
                </span>
              </div>
            </div>

            <button
              className={styles.bookButton}
              onClick={() => setShowModal(true)}
              disabled={!canBookRide() || isBooking}
            >
              {isBooking ? "Réservation en cours..." : "Participer"}
            </button>

            {!canBookRide() && user && <p className={styles.unavailableReason}>{getUnavailabilityReason()}</p>}

            {!user && (
              <p className={styles.loginMessage}>
                <Link to="/login">Connectez-vous</Link> pour réserver ce covoiturage
              </p>
            )}
          </div>
        </div>

        <Link to={`/user/${driver.id}/show`} className={styles.driverInfo}>
          <div className={styles.driverMainInfo}>
            <div className={styles.driverMainInfoContent}>
              <div className={styles.avatarWrapper}>
                {driver.avatar ? (
                  <img src={driver.avatar} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  <img src={DefaultAvatar} alt="Avatar" className={styles.avatarImage} />
                )}
              </div>

              <div className={styles.nameContainer}>
                <p className={styles.driverName}>{driver.firstName}</p>
                <p className={styles.driverPseudo}>@{driver.pseudo}</p>
              </div>

              {driver.averageRating && (
                <div className={styles.ratingContainer}>
                  <StarIcon className={styles.starIcon} />
                  <p className={styles.ratingScore}>{parseFloat(driver.averageRating).toFixed(1)}</p>
                </div>
              )}
            </div>

            <RightArrow className={styles.arrowIcon} />
          </div>

          {preferences && preferences.length > 0 && (
            <div className={styles.preferencesList}>
              {preferences.map((preference, index) => (
                <div key={index} className={styles.preferenceItem}>
                  {preference}
                </div>
              ))}
            </div>
          )}
        </Link>

        <div className={styles.passengersList}>
          <p className={styles.passengersListTitle}>Passagers</p>
          <div className={styles.passengersListContainer}>
            {passengers && passengers.length > 0 ? (
              passengers.map((passenger, index: number) => (
                <Link key={index} to={`/user/${passenger.id}/show`} className={styles.passengerItem}>
                  <div className={styles.passengerMainInfo}>
                    <div className={styles.passengerAvatar}>
                      {passenger.avatar ? (
                        <img src={passenger.avatar} alt="Avatar" className={styles.passengerAvatarImage} />
                      ) : (
                        <img src={DefaultAvatar} alt="Avatar" className={styles.passengerAvatarImage} />
                      )}
                    </div>

                    <p className={styles.passengerPseudo}>@{passenger.pseudo}</p>
                  </div>

                  <RightArrow className={styles.arrowIcon} />
                </Link>
              ))
            ) : (
              <p className={styles.noPassengers}>Aucun passager n'a encore rejoint ce covoiturage</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ConfirmationModal
          title="Confirmation de réservation"
          message="Prêt(e) à rejoindre ce trajet ?"
          onCancel={() => setShowModal(false)}
          onConfirm={handleBookRide}
        />
      )}
    </div>
  );
};

export default RidePublicInfoPage;
