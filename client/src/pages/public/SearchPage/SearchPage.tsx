import classNames from "classnames";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./SearchPage.module.css";

import type { SearchRideWithoutFilters } from "@/types/RideTypes";

const SearchPage = () => {
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [departureLocation, setDepartureLocation] = useState<string>("");
  const [arrivalLocation, setArrivalLocation] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>("");

  const navigate = useNavigate();

  const minDate = dayjs().format("YYYY-MM-DD");
  const maxDate = dayjs().add(1, "year").format("YYYY-MM-DD");

  const validateForm = (data: SearchRideWithoutFilters) => {
    setError({});

    if (!data.departureLocation) {
      setError({ departureLocation: "Veuillez renseigner un lieu de départ." });
      return false;
    }

    if (!data.arrivalLocation) {
      setError({ arrivalLocation: "Veuillez renseigner un lieu d'arrivée." });
      return false;
    } else if (data.arrivalLocation === data.departureLocation) {
      setError({ arrivalLocation: "Veuillez renseigner un lieu d'arrivée différent du lieu de départ." });
      return false;
    }

    if (!data.departureDate) {
      setError({ departureDate: "Veuillez sélectionner une date de départ." });
      return false;
    } else if (!dayjs(data.departureDate).isValid()) {
      setError({ departureDate: "Veuillez sélectionner une date de départ valide." });
      return false;
    } else if (dayjs(data.departureDate).isBefore(dayjs().startOf("day"))) {
      setError({ departureDate: "Veuillez sélectionner une date de départ à venir (aujourd'hui inclus)." });
      return false;
    } else if (dayjs(data.departureDate).isAfter(dayjs().add(1, "year"))) {
      setError({ departureDate: "Veuillez sélectionner une date de départ dans l’année à venir." });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedData: SearchRideWithoutFilters = {
      departureLocation: departureLocation.trim(),
      arrivalLocation: arrivalLocation.trim(),
      departureDate: departureDate.trim(),
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) return;

    const query = new URLSearchParams(cleanedData).toString();

    navigate(`/results?${query}`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Quelle est votre prochaine destination ?</h1>

        <form noValidate className={styles.searchForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="departureLocation" className={styles.label}>
              Lieu de départ
            </label>
            <input
              type="text"
              id="departureLocation"
              name="departureLocation"
              className={classNames(styles.inputField, styles.inputFieldDeparture, {
                [styles.hasError]: error.departureLocation,
              })}
              placeholder="ex: Lyon"
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
              aria-invalid={!!error.departureLocation}
              aria-describedby="departureLocation-error"
            />
            {error.departureLocation && (
              <p className={styles.inputErrorMessage} id="departureLocation-error">
                {error.departureLocation}
              </p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="arrivalLocation" className={styles.label}>
              Lieu d'arrivée
            </label>
            <input
              type="text"
              id="arrivalLocation"
              name="arrivalLocation"
              className={classNames(styles.inputField, styles.inputFieldArrival, {
                [styles.hasError]: error.arrivalLocation,
              })}
              placeholder="ex: Saint-Étienne"
              value={arrivalLocation}
              onChange={(e) => setArrivalLocation(e.target.value)}
              aria-invalid={!!error.arrivalLocation}
              aria-describedby="arrivalLocation-error"
            />
            {error.arrivalLocation && (
              <p className={styles.inputErrorMessage} id="arrivalLocation-error">
                {error.arrivalLocation}
              </p>
            )}
          </div>
          {/*TODO améliorer l'apparence du champ date*/}
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Date de départ
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className={classNames(styles.inputField, styles.dateInput, {
                [styles.hasError]: error.departureDate,
              })}
              value={departureDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              aria-invalid={!!error.departureDate}
              aria-describedby="departureDate-error"
            />
            {error.departureDate && (
              <p className={styles.inputErrorMessage} id="departureDate-error">
                {error.departureDate}
              </p>
            )}
          </div>
          <button type="submit" className={styles.searchButton}>
            Rechercher
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchPage;
