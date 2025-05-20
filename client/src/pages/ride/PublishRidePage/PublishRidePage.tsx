import { AxiosError } from "axios";
import classNames from "classnames";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import InfoIcon from "@/assets/images/info-icon.svg?react";

import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import Dropdown from "@/components/Dropdown/Dropdown";
import Loader from "@/components/Loader/Loader";
import useAccount from "@/hooks/useAccount";
import RideService from "@/services/RideService";
import UserService from "@/services/UserService";

import styles from "./PublishRidePage.module.css";

import type { CreateRideData } from "@/types/RideTypes";
import type { User } from "@/types/UserTypes";

interface VehicleOption {
  id: string;
  label: string;
}

const CreateRidePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [canPublish, setCanPublish] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [hasVehicles, setHasVehicles] = useState<boolean>(true);

  const [departureLocation, setDepartureLocation] = useState<string>("");
  const [arrivalLocation, setArrivalLocation] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>("");
  const [departureTime, setDepartureTime] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [offeredSeats, setOfferedSeats] = useState<number>(0);

  const [rideToCreate, setRideToCreate] = useState<CreateRideData | null>(null);

  const navigate = useNavigate();
  const { account } = useAccount();
  const user = account as User;
  const { isDriver } = user;

  const minDate = dayjs().format("YYYY-MM-DD");
  const maxDate = dayjs().add(1, "year").format("YYYY-MM-DD");

  const validateForm = (data: CreateRideData): boolean => {
    setError({});

    if (data.vehicleId === "") {
      setError({ vehicle: "Veuillez sélectionner un véhicule" });
      return false;
    }

    if (data.departureLocation === "") {
      setError({ departureLocation: "Veuillez renseigner un lieu de départ" });
      return false;
    }

    if (data.arrivalLocation === "") {
      setError({ arrivalLocation: "Veuillez renseigner un lieu d'arrivée" });
      return false;
    }

    if (data.departureDate === "") {
      setError({ departureDate: "Veuillez renseigner une date de départ" });
      return false;
    } else if (dayjs(data.departureDate).isBefore(dayjs().startOf("day"))) {
      setError({ departureDate: "Veuillez sélectionner une date de départ à venir (aujourd'hui inclus)." });
      return false;
    } else if (dayjs(data.departureDate).isAfter(dayjs().add(1, "year"))) {
      setError({ departureDate: "Veuillez sélectionner une date de départ dans l'année à venir." });
      return false;
    }

    if (data.departureTime === "") {
      setError({ departureTime: "Veuillez renseigner une heure de départ" });
      return false;
    }

    if (data.arrivalTime === "") {
      setError({ arrivalTime: "Veuillez renseigner une heure d'arrivée" });
      return false;
    }

    const departureTime = dayjs(data.departureDate + " " + data.departureTime);
    const arrivalTime = dayjs(data.departureDate + " " + data.arrivalTime);

    if (arrivalTime.isBefore(departureTime)) {
      setError({ arrivalTime: "Veuillez sélectionner une heure d'arrivée postérieure à l'heure de départ" });
      return false;
    } else if (departureTime.isBefore(dayjs())) {
      setError({ departureTime: "Veuillez sélectionner une heure de départ ultérieure à l'heure actuelle" });
      return false;
    }

    if (!data.price) {
      setError({ price: "Veuillez renseigner un prix" });
      return false;
    } else if (data.price <= 10) {
      setError({ price: "Le prix doit être supérieur à 10 crédits (1€)" });
      return false;
    } else if (data.price > 500) {
      setError({ price: "Le prix doit être inférieur à 500 crédits (50€)" });
      return false;
    }

    if (!data.offeredSeats) {
      setError({ offeredSeats: "Veuillez renseigner le nombre de places proposées" });
      return false;
    } else if (data.offeredSeats <= 0) {
      setError({ offeredSeats: "Le nombre de places offertes doit être supérieur à 0" });
      return false;
    } else if (data.offeredSeats > 4) {
      setError({ offeredSeats: "Le nombre de places offertes doit être au maximum 4" });
      return false;
    }

    return true;
  };

  const handlePublishBtnClick = (): void => {
    const cleanedData: CreateRideData = {
      departureLocation: departureLocation.trim(),
      arrivalLocation: arrivalLocation.trim(),
      departureDate,
      departureTime,
      arrivalDate: departureDate,
      arrivalTime,
      vehicleId,
      price,
      offeredSeats,
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    setRideToCreate(cleanedData);
    setShowModal(true);
  };

  const handleConfirmPublish = async (): Promise<void> => {
    if (!rideToCreate) {
      setShowModal(false);
      return;
    }

    setShowModal(false);
    setIsSubmitting(true);

    try {
      await RideService.createRide(rideToCreate);
      toast.success("Trajet créé avec succès");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        toast.error(message ?? "Erreur lors de la création du trajet");
      } else {
        toast.error("Erreur lors de la création du trajet");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDriver) {
      setCanPublish(false);
    }
  }, [isDriver]);

  useEffect(() => {
    const fetchUserVehicles = async (): Promise<void> => {
      try {
        const vehicles = await UserService.getMyVehicles();

        if (vehicles.length === 0) {
          setHasVehicles(false);
        } else {
          const options = vehicles.map((vehicle) => ({
            id: vehicle.id,
            label: `${vehicle.licensePlate} (${vehicle.brand} ${vehicle.model}) `,
          }));

          setVehicleOptions(options);
          setHasVehicles(true);
        }
      } catch {
        navigate("/dashboard");
        toast.error("Oups ! Une erreur est survenue lors de la récupération de vos véhicules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserVehicles();
  }, [navigate]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.createRideContainer}>
        <h1 className={styles.title}>Créer un trajet</h1>

        {!hasVehicles ? (
          <div className={styles.noVehicleContainer}>
            <p>Vous n'avez pas encore de véhicule enregistré.</p>
            <p>Vous devez ajouter un véhicule pour pouvoir créer un trajet.</p>
            <Link to="/dashboard/profile/vehicle/add" className={styles.addVehicleButton}>
              + Ajouter un véhicule
            </Link>
          </div>
        ) : (
          <>
            <div className={classNames(styles.infoContainer, { [styles.urgent]: canPublish === false })}>
              <InfoIcon className={styles.infoIcon} />
              {canPublish ? (
                <p className={styles.infoText}>
                  La plateforme prélève une commission de <span>2 crédits</span> sur chaque réservation.
                </p>
              ) : (
                <p className={styles.infoText}>
                  Vous devez être chauffeur pour créer un trajet. Rendez-vous dans votre{" "}
                  <Link to="/dashboard/profile" className={styles.profileLink}>
                    profil
                  </Link>{" "}
                  pour modifier votre rôle.
                </p>
              )}
            </div>

            <form noValidate className={styles.form}>
              {/* Véhicule */}
              <div className={classNames(styles.formGroup, styles.vehicle)}>
                <Dropdown
                  label="Véhicule"
                  options={vehicleOptions}
                  value={vehicleId}
                  onChange={(value) => setVehicleId(value as string)}
                  placeholder="Sélectionnez un véhicule"
                  hasError={!!error.vehicle}
                  disabled={!canPublish}
                />
                {error.vehicle && (
                  <div className={classNames(styles.errorMessage, styles.inputErrorMessage)}>{error.vehicle}</div>
                )}

                <div className={styles.newVehicleContainer}>
                  <p>ou</p>
                  <Link
                    to="/dashboard/profile/vehicle/add"
                    className={classNames(styles.newVehicleButton, { [styles.disabled]: !canPublish })}
                  >
                    + Nouveau véhicule
                  </Link>
                </div>
              </div>

              {/* Lieu de départ */}
              <div className={classNames(styles.formGroup, styles.departureLocation)}>
                <label htmlFor="departureLocation" className={styles.label}>
                  Lieu de départ
                </label>
                <input
                  type="text"
                  id="departureLocation"
                  name="departureLocation"
                  className={classNames(styles.inputField, { [styles.hasError]: error.departureLocation })}
                  placeholder="ex: Paris, Lyon, etc."
                  value={departureLocation}
                  autoComplete="off"
                  disabled={!canPublish}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                  aria-invalid={!!error.departureLocation}
                  aria-describedby="departureLocation-error"
                />
                {error.departureLocation && (
                  <div
                    id="departureLocation-error"
                    className={classNames(styles.errorMessage, styles.inputErrorMessage)}
                  >
                    {error.departureLocation}
                  </div>
                )}
              </div>

              {/* Lieu d'arrivée */}
              <div className={classNames(styles.formGroup, styles.arrivalLocation)}>
                <label htmlFor="arrivalLocation" className={styles.label}>
                  Lieu d'arrivée
                </label>
                <input
                  type="text"
                  id="arrivalLocation"
                  name="arrivalLocation"
                  className={classNames(styles.inputField, { [styles.hasError]: error.arrivalLocation })}
                  placeholder="ex: Paris, Lyon, etc."
                  value={arrivalLocation}
                  autoComplete="off"
                  disabled={!canPublish}
                  onChange={(e) => setArrivalLocation(e.target.value)}
                  aria-invalid={!!error.arrivalLocation}
                  aria-describedby="arrivalLocation-error"
                />
                {error.arrivalLocation && (
                  <div id="arrivalLocation-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                    {error.arrivalLocation}
                  </div>
                )}
              </div>

              {/* Date de départ */}
              <div className={classNames(styles.formGroup, styles.departureDate)}>
                <label htmlFor="departureDate" className={styles.label}>
                  Date de départ
                </label>
                <input
                  type="date"
                  id="departureDate"
                  name="departureDate"
                  className={classNames(styles.inputField, { [styles.hasError]: error.departureDate })}
                  value={departureDate}
                  min={minDate}
                  max={maxDate}
                  disabled={!canPublish}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  aria-invalid={!!error.departureDate}
                  aria-describedby="departureDate-error"
                />
                {error.departureDate && (
                  <div id="departureDate-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                    {error.departureDate}
                  </div>
                )}
              </div>

              {/* Heure de départ */}
              <div className={classNames(styles.formGroup, styles.departureTime)}>
                <label htmlFor="departureTime" className={styles.label}>
                  Heure de départ
                </label>
                <input
                  type="time"
                  id="departureTime"
                  name="departureTime"
                  className={classNames(styles.inputField, { [styles.hasError]: error.departureTime })}
                  value={departureTime}
                  disabled={!canPublish}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  aria-invalid={!!error.departureTime}
                  aria-describedby="departureTime-error"
                />
                {error.departureTime && (
                  <div id="departureTime-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                    {error.departureTime}
                  </div>
                )}
              </div>

              {/* Heure d'arrivée */}
              <div className={classNames(styles.formGroup, styles.arrivalTime)}>
                <label htmlFor="arrivalTime" className={styles.label}>
                  Heure d'arrivée
                </label>
                <input
                  type="time"
                  id="arrivalTime"
                  name="arrivalTime"
                  className={classNames(styles.inputField, { [styles.hasError]: error.arrivalTime })}
                  value={arrivalTime}
                  disabled={!canPublish}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  aria-invalid={!!error.arrivalTime}
                  aria-describedby="arrivalTime-error"
                />
                {error.arrivalTime && (
                  <div id="arrivalTime-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                    {error.arrivalTime}
                  </div>
                )}
              </div>

              {/* Prix */}
              <div className={classNames(styles.formGroup, styles.price)}>
                <label htmlFor="price" className={styles.label}>
                  Prix par passager (Crédits)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className={classNames(styles.inputField, { [styles.hasError]: error.price })}
                  min={1}
                  placeholder="ex: 20"
                  value={price || ""}
                  autoComplete="off"
                  disabled={!canPublish}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  aria-invalid={!!error.price}
                  aria-describedby="price-error"
                />
                {error.price && (
                  <div id="price-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                    {error.price}
                  </div>
                )}
              </div>

              {/* Nombre de places */}
              <div className={classNames(styles.formGroup, styles.offeredSeats)}>
                <label htmlFor="offeredSeats" className={styles.label}>
                  Nombre de places proposées
                </label>
                <input
                  type="number"
                  id="offeredSeats"
                  name="offeredSeats"
                  className={classNames(styles.inputField, { [styles.hasError]: error.offeredSeats })}
                  min={1}
                  max={4}
                  placeholder="ex: 3"
                  value={offeredSeats || ""}
                  autoComplete="off"
                  disabled={!canPublish}
                  onChange={(e) => setOfferedSeats(Number(e.target.value))}
                  aria-invalid={!!error.offeredSeats}
                  aria-describedby="offeredSeats-error"
                />
                {error.offeredSeats && (
                  <div id="offeredSeats-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                    {error.offeredSeats}
                  </div>
                )}
              </div>

              <div className={styles.buttonsContainer}>
                <Link to="/dashboard" className={styles.cancelButton}>
                  Annuler
                </Link>
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={handlePublishBtnClick}
                  disabled={isSubmitting || !canPublish}
                >
                  {isSubmitting ? "Publication en cours..." : "Publier le trajet"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {showModal && (
        <ConfirmationModal
          title="Confirmation de publication"
          message="Voulez-vous vraiment publier le trajet ?"
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmPublish}
        />
      )}
    </div>
  );
};

export default CreateRidePage;
