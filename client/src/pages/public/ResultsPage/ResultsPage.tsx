import classNames from "classnames";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import CrossIcon from "@/assets/images/cross-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import EcoIcon from "@/assets/images/eco-icon.svg?react";
import StarIcon from "@/assets/images/star-icon.svg?react";

import Loader from "@/components/Loader/Loader";
import Selector from "@/components/Selector/Selector";
import RideService from "@/services/RideService";

import styles from "./ResultsPage.module.css";

import type { Ride, SearchRide } from "@/types/RideTypes";

const driverRatingOptions = [
  { value: "", label: "Non spécifié" },
  { value: "3.5", label: "3.5+" },
  { value: "4", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
  { value: "4.8", label: "4.8+" },
  { value: "5", label: "5.0" },
];

const defaultFilters = {
  isEcoFriendly: false,
  maxPrice: 500,
  maxDuration: 360,
  minRating: "",
};

const formatDate = (date: string) => {
  return dayjs(date)
    .locale("fr")
    .format("dddd D MMMM YYYY")
    .replace(/^./, (char) => char.toUpperCase());
};

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(true);

  const [searchDraft, setSearchDraft] = useState<SearchRide>({
    departureLocation: "",
    arrivalLocation: "",
    departureDate: "",
    ...defaultFilters,
  });

  const [confirmedSearch, setConfirmedSearch] = useState<SearchRide>({
    departureLocation: "",
    arrivalLocation: "",
    departureDate: "",
    ...defaultFilters,
  });

  const [results, setResults] = useState<Ride[]>([]);

  const resetFilters = () => {
    setSearchDraft((prev) => ({
      ...prev,
      ...defaultFilters,
    }));

    setConfirmedSearch((prev) => ({
      ...prev,
      ...defaultFilters,
    }));
  };

  const validateForm = (data: Partial<SearchRide>) => {
    setFormErrors({});

    if (!data.departureLocation) {
      setFormErrors({ departureLocation: "Veuillez renseigner un lieu de départ." });
      return false;
    }

    if (!data.arrivalLocation) {
      setFormErrors({ arrivalLocation: "Veuillez renseigner un lieu d'arrivée." });
      return false;
    } else if (data.arrivalLocation === data.departureLocation) {
      setFormErrors({ arrivalLocation: "Veuillez renseigner un lieu d'arrivée différent du lieu de départ." });
      return false;
    }

    if (!data.departureDate) {
      setFormErrors({ departureDate: "Veuillez sélectionner une date de départ." });
      return false;
    } else if (!dayjs(data.departureDate).isValid()) {
      setFormErrors({ departureDate: "Veuillez sélectionner une date de départ valide." });
      return false;
    } else if (dayjs(data.departureDate).isBefore(dayjs().startOf("day"))) {
      setFormErrors({ departureDate: "Veuillez sélectionner une date de départ à venir (aujourd'hui inclus)." });
      return false;
    } else if (dayjs(data.departureDate).isAfter(dayjs().add(1, "year"))) {
      setFormErrors({ departureDate: "Veuillez sélectionner une date de départ dans l'année à venir." });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimSearchData = (data: { departureLocation: string; arrivalLocation: string; departureDate: string }) => ({
      departureLocation: data.departureLocation.trim(),
      arrivalLocation: data.arrivalLocation.trim(),
      departureDate: data.departureDate.trim(),
    });

    // ...

    const cleanedDraft = trimSearchData(searchDraft);
    const cleanedConfirmed = trimSearchData(confirmedSearch);

    if (
      cleanedDraft.departureLocation === cleanedConfirmed.departureLocation &&
      cleanedDraft.arrivalLocation === cleanedConfirmed.arrivalLocation &&
      cleanedDraft.departureDate === cleanedConfirmed.departureDate
    ) {
      return;
    }

    const isValid = validateForm(cleanedDraft);

    if (!isValid) return;

    const searchParams = new URLSearchParams(cleanedDraft).toString();

    navigate(`/results?${searchParams}`);
  };

  const fetchResults = async (params: SearchRide, initial = false) => {
    if (initial) {
      setIsInitialLoad(false);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await RideService.searchRides(params);
      const rides = data.data;
      setResults(rides);
    } catch (error: unknown) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isMobileView = window.innerWidth <= 480;

    if (isMobileView) {
      if (isFiltersVisible) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFiltersVisible]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const departure = urlParams.get("departureLocation") ?? "";
    const arrival = urlParams.get("arrivalLocation") ?? "";
    const date = urlParams.get("departureDate") ?? "";

    if (!departure || !arrival || !date) {
      navigate("/search");
    }

    setConfirmedSearch((prev) => ({
      ...prev,
      departureLocation: departure,
      arrivalLocation: arrival,
      departureDate: date,
    }));

    setSearchDraft((prev) => ({
      ...prev,
      departureLocation: departure,
      arrivalLocation: arrival,
      departureDate: date,
    }));
  }, [location.search, navigate]);

  useEffect(() => {
    const cleanedData: SearchRide = {
      ...confirmedSearch,
      minRating:
        confirmedSearch.minRating && confirmedSearch.minRating.length > 0 ? confirmedSearch.minRating : undefined,
    };

    if (isInitialLoad) {
      fetchResults(cleanedData, true);
    } else {
      fetchResults(cleanedData);
    }
  }, [confirmedSearch, isInitialLoad]);

  if (isInitialLoad) return <Loader />;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.searchContainer}>
        {/* Formulaire de recherche */}
        <form noValidate className={styles.searchForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="departureLocation" className={styles.label}>
              Lieu de départ
            </label>
            <input
              type="text"
              id="departureLocation"
              name="departureLocation"
              value={searchDraft.departureLocation}
              className={classNames(styles.inputField, { [styles.hasError]: formErrors.departureLocation })}
              placeholder="ex: Lyon, Paris, etc."
              onChange={(e) => setSearchDraft({ ...searchDraft, departureLocation: e.target.value })}
              aria-invalid={!!formErrors.departureLocation}
              aria-describedby="departureLocation-error"
            />
            {formErrors.departureLocation && (
              <p className={styles.inputErrorMessage} id="departureLocation-error">
                {formErrors.departureLocation}
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
              value={searchDraft.arrivalLocation}
              className={classNames(styles.inputField, { [styles.hasError]: formErrors.arrivalLocation })}
              placeholder="ex: Saint-Étienne, Marseille, etc."
              onChange={(e) => setSearchDraft({ ...searchDraft, arrivalLocation: e.target.value })}
              aria-invalid={!!formErrors.arrivalLocation}
              aria-describedby="arrivalLocation-error"
            />
            {formErrors.arrivalLocation && (
              <p className={styles.inputErrorMessage} id="arrivalLocation-error">
                {formErrors.arrivalLocation}
              </p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="departureDate" className={styles.label}>
              Date de départ
            </label>
            <input
              type="date"
              id="departureDate"
              name="departureDate"
              value={searchDraft.departureDate}
              className={styles.inputField}
              onChange={(e) => setSearchDraft({ ...searchDraft, departureDate: e.target.value })}
              aria-invalid={!!formErrors.departureDate}
              aria-describedby="departureDate-error"
            />
            {formErrors.departureDate && (
              <p className={styles.inputErrorMessage} id="departureDate-error">
                {formErrors.departureDate}
              </p>
            )}
          </div>
          <button type="submit" className={styles.searchButton}>
            Rechercher
          </button>
        </form>

        {/* Bouton afficher/masquer filtres (visible uniquement en mobile) */}
        <button className={styles.toggleFiltersButton} onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
          {isFiltersVisible ? "Masquer les filtres" : "Afficher les filtres"}
        </button>

        {/* Filtres */}
        {isFiltersVisible && (
          <div className={styles.filtersContainer}>
            <div className={styles.filtersHeader}>
              <div className={styles.filtersTitleAndClose}>
                <p className={styles.filtersTitle}>Filtres</p>
                {isFiltersVisible && (
                  <button
                    className={styles.closeFiltersButton}
                    onClick={() => setIsFiltersVisible(false)}
                    aria-label="Fermer les filtres"
                  >
                    <CrossIcon className={styles.closeIcon} />
                  </button>
                )}
              </div>
              <button className={styles.resetButton} onClick={resetFilters} aria-label="Réinitialiser les filtres">
                Réinitialiser
              </button>
            </div>

            <div className={styles.filterList}>
              {/* Filtre Eco-friendly */}
              <div className={styles.filterGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={confirmedSearch.isEcoFriendly}
                    onChange={(e) => setConfirmedSearch((prev) => ({ ...prev, isEcoFriendly: e.target.checked }))}
                  />
                  <span>Eco-friendly</span>
                </label>
              </div>

              {/* Filtre Prix max */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  Prix max : <span> {searchDraft.maxPrice}</span> crédits
                </label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={searchDraft.maxPrice}
                    onChange={(e) => setSearchDraft((prev) => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                    onMouseUp={() => setConfirmedSearch((prev) => ({ ...prev, maxPrice: searchDraft.maxPrice }))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderValue}>
                    <span>10 crédits</span>
                    <span>500 crédits</span>
                  </div>
                </div>
              </div>

              {/* Filtre Durée max */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  Durée max :{" "}
                  <span>
                    {Math.floor(searchDraft.maxDuration / 60)}h
                    {searchDraft.maxDuration % 60 > 0 ? searchDraft.maxDuration % 60 : "00"}
                  </span>
                </label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={searchDraft.maxDuration}
                    onChange={(e) => setSearchDraft((prev) => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                    onMouseUp={() => setConfirmedSearch((prev) => ({ ...prev, maxDuration: searchDraft.maxDuration }))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderValue}>
                    <span>0h00</span>
                    <span>6h00</span>
                  </div>
                </div>
              </div>

              {/* Filtre Note chauffeur */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Note chauffeur :</label>

                <Selector
                  options={driverRatingOptions}
                  value={confirmedSearch.minRating ?? ""}
                  onChange={(value) => setConfirmedSearch((prev) => ({ ...prev, minRating: value.toString() }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <p className={styles.searchSummary}>
            <span>{formatDate(confirmedSearch.departureDate)}</span>
            <span>
              {confirmedSearch.departureLocation} → {confirmedSearch.arrivalLocation}
            </span>
          </p>

          <p className={styles.resultsCount}>{results.length} trajets trouvés</p>
        </div>

        {/* Liste des résultats */}
        {isLoading ? (
          <Loader />
        ) : (
          <div className={styles.resultsList}>
            {results.length > 0 ? (
              results.map((result) => (
                <div key={result.id} className={styles.resultCard}>
                  {/* Informations sur le trajet */}
                  <div className={styles.cardHeader}>
                    <p className={styles.duration}>
                      {Math.floor(result.duration / 60)}h{result.duration % 60 > 0 ? result.duration % 60 : "00"}
                    </p>
                    {result.isEcoFriendly && <EcoIcon className={styles.ecoFriendlyIcon} />}
                  </div>

                  <div className={styles.rideInfoContainer}>
                    <div className={styles.rideDetails}>
                      <div className={styles.location}>
                        <p className={styles.departure}>{result.departureLocation}</p>
                        <p className={styles.arrival}>{result.arrivalLocation}</p>
                      </div>
                      <div className={styles.time}>
                        <p>{result.departureTime}</p>
                        <p>{result.arrivalTime}</p>
                      </div>
                    </div>

                    {/* Informations sur le prix et les places disponibles */}
                    <div className={styles.priceSeats}>
                      <p className={styles.seatsAvailable}>{result.availableSeats} places disponibles</p>
                      <div className={styles.priceTag}>
                        <p>{result.price}</p>
                        <p>Crédits</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.driverInfoContainer}>
                    {/* Informations sur le conducteur */}
                    <div className={styles.driverInfo}>
                      <div className={styles.avatarContainer}>
                        {result.driver.avatar ? (
                          <img src={result.driver.avatar} className={styles.avatarImage} alt="Avatar" />
                        ) : (
                          <img src={DefaultAvatar} className={styles.avatarImage} alt="Avatar" />
                        )}
                      </div>
                      <p className={styles.driverName}>{result.driver.firstName}</p>
                      <div className={styles.driverRating}>
                        <StarIcon className={styles.starIcon} />
                        <p>{result.driver.averageRating}</p>
                      </div>
                    </div>

                    {/* Bouton Détails */}
                    <Link to={`/ride/${result.id}/show`} className={styles.detailsButton}>
                      Détails
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>Aucun trajet ne correspond à vos critères.</p>
                <p>Essayez de modifier vos filtres ou de changer de date de départ.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
