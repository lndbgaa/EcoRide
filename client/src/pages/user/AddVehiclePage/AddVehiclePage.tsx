import Dropdown from "@/components/Dropdown/Dropdown";
import Loader from "@/components/Loader/Loader";
import CatalogService from "@/services/CatalogService";
import VehicleService from "@/services/VehicleService";
import { AxiosError } from "axios";
import classNames from "classnames";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import styles from "./AddVehiclePage.module.css";

import type { CreateVehicle } from "@/types/VehicleTypes";

interface Option {
  id: number;
  label: string;
}

const AddVehiclePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [colorOptions, setColorOptions] = useState<Option[]>([]);
  const [energyOptions, setEnergyOptions] = useState<Option[]>([]);

  const [brandId, setBrandId] = useState<number>(0);
  const [model, setModel] = useState<string>("");
  const [colorId, setColorId] = useState<number>(0);
  const [energyId, setEnergyId] = useState<number>(0);
  const [seats, setSeats] = useState<number>(0);
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [firstRegistration, setFirstRegistration] = useState<string>("");

  const navigate = useNavigate();

  const maxDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const validateForm = (data: CreateVehicle): boolean => {
    setError({});

    if (data.brandId === 0) {
      setError({ brand: "Veuillez sélectionner une marque" });
      return false;
    }

    if (data.model === "") {
      setError({ model: "Champ requis" });
      return false;
    }

    if (data.colorId === 0) {
      setError({ color: "Veuillez sélectionner une couleur" });
      return false;
    }

    if (data.energyId === 0) {
      setError({ energy: "Veuillez sélectionner une énergie" });
      return false;
    }

    if (data.seats < 2 || data.seats > 7) {
      setError({ seats: "Nombre de place invalide (min. 2 max. 7 places)" });
      return false;
    }

    if (!/^[A-Z]{2}-\d{3}-[A-Z]{2}$/i.test(data.licensePlate)) {
      setError({ licensePlate: "Plaque d'immatriculation invalide (Format: AA-123-AA)" });
      return false;
    }

    if (data.firstRegistration === "") {
      setError({ firstRegistration: "Veuillez sélectionner une date" });
      return false;
    } else if (!dayjs(data.firstRegistration, "YYYY-MM-DD", true).isValid()) {
      setError({ firstRegistration: "Date invalide" });
      return false;
    } else if (dayjs(data.firstRegistration, "YYYY-MM-DD", true).isAfter(dayjs().subtract(1, "day"))) {
      setError({ firstRegistration: "La date de première immatriculation doit être antérieure à la date du jour" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (isSubmitting) return;

    e.preventDefault();
    setIsSubmitting(true);

    const cleanedData: CreateVehicle = {
      brandId,
      model: model.trim().toUpperCase(),
      colorId,
      energyId,
      seats,
      licensePlate: licensePlate.trim().toUpperCase(),
      firstRegistration,
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await VehicleService.addVehicle(cleanedData);
      toast.success("Véhicule ajouté avec succès");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        toast.error(message ?? "Erreur lors de l'ajout du véhicule");
      } else {
        toast.error("Erreur lors de l'ajout du véhicule");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchVehicleOptions = async (): Promise<void> => {
      try {
        const [brands, colors, energies] = await Promise.all([
          CatalogService.getVehicleBrands(),
          CatalogService.getVehicleColors(),
          CatalogService.getVehicleEnergies(),
        ]);

        setBrandOptions(brands);
        setColorOptions(colors);
        setEnergyOptions(energies);
        setError({});
      } catch {
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleOptions();
  }, [navigate]);

  if (isLoading) return <Loader width="7rem" height="7rem" />;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.addVehicleContainer}>
        <h1 className={styles.title}>Ajouter un véhicule</h1>

        {error.submitVehicle && <div className={styles.errorMessage}>{error.submitVehicle}</div>}

        <form noValidate onSubmit={handleSubmit} className={styles.form}>
          {/*Marque*/}
          <div className={classNames(styles.formGroup, styles.brand)}>
            <Dropdown
              label="Marque"
              options={brandOptions}
              value={brandId}
              onChange={(value) => setBrandId(value as number)}
              placeholder="Sélectionnez une marque"
              hasError={!!error.brand}
            />
            {error.brand && (
              <div className={classNames(styles.errorMessage, styles.inputErrorMessage)}>{error.brand}</div>
            )}
          </div>

          {/*Modèle*/}
          <div className={classNames(styles.formGroup, styles.model)}>
            <label htmlFor="model" className={styles.label}>
              Modèle
            </label>
            <input
              type="text"
              id="model"
              name="model"
              className={classNames(styles.input, { [styles.hasError]: error.model })}
              placeholder="ex: Clio, 308, etc."
              value={model}
              autoComplete="off"
              onChange={(e) => setModel(e.target.value)}
              aria-invalid={!!error.model}
              aria-describedby="model-error"
            />
            {error.model && (
              <div id="model-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                {error.model}
              </div>
            )}
          </div>

          {/*Couleur*/}
          <div className={classNames(styles.formGroup, styles.color)}>
            <Dropdown
              label="Couleur"
              options={colorOptions}
              value={colorId}
              onChange={(value) => setColorId(value as number)}
              placeholder="Sélectionnez une couleur"
              hasError={!!error.color}
            />
            {error.color && (
              <div className={classNames(styles.errorMessage, styles.inputErrorMessage)}>{error.color}</div>
            )}
          </div>

          {/*Energie*/}
          <div className={classNames(styles.formGroup, styles.energy)}>
            <Dropdown
              label="Energie"
              options={energyOptions}
              value={energyId}
              onChange={(value) => setEnergyId(value as number)}
              placeholder="Sélectionnez une énergie"
              hasError={!!error.energy}
            />
            {error.energy && (
              <div className={classNames(styles.errorMessage, styles.inputErrorMessage)}>{error.energy}</div>
            )}
          </div>

          {/*Nombre de place*/}
          <div className={classNames(styles.formGroup, styles.seats)}>
            <label htmlFor="seats" className={styles.label}>
              Nombre de place
            </label>
            <input
              type="number"
              id="seats"
              name="seats"
              className={classNames(styles.input, { [styles.hasError]: error.seats })}
              min={2}
              max={7}
              placeholder="min. 2 max. 7 places"
              value={seats || ""}
              autoComplete="off"
              onChange={(e) => setSeats(Number(e.target.value))}
              aria-invalid={!!error.seats}
              aria-describedby="seats-error"
            />
            {error.seats && (
              <div id="seats-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                {error.seats}
              </div>
            )}
          </div>

          {/*Plaque d'immatriculation*/}
          <div className={classNames(styles.formGroup, styles.licensePlate)}>
            <label htmlFor="licensePlate" className={styles.label}>
              Plaque d'immatriculation
            </label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              className={classNames(styles.input, { [styles.hasError]: error.licensePlate })}
              placeholder="ex: AB-123-CD"
              value={licensePlate}
              autoComplete="off"
              onChange={(e) => setLicensePlate(e.target.value)}
              aria-invalid={!!error.licensePlate}
              aria-describedby="licensePlate-error"
            />
            {error.licensePlate && (
              <div id="licensePlate-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                {error.licensePlate}
              </div>
            )}
          </div>

          {/*TODO améliorer l'apparence du champ date*/}
          {/*Première immatriculation */}
          <div className={classNames(styles.formGroup, styles.firstRegistration)}>
            <label htmlFor="firstRegistration" className={styles.label}>
              Date de première immatriculation
            </label>
            <input
              type="date"
              id="firstRegistration"
              name="firstRegistration"
              className={classNames(styles.input, { [styles.hasError]: error.firstRegistration })}
              value={firstRegistration}
              autoComplete="off"
              max={maxDate}
              onChange={(e) => setFirstRegistration(e.target.value)}
              aria-invalid={!!error.firstRegistration}
              aria-describedby="firstRegistration-error"
            />
            {error.firstRegistration && (
              <div id="firstRegistration-error" className={classNames(styles.errorMessage, styles.inputErrorMessage)}>
                {error.firstRegistration}
              </div>
            )}
          </div>

          <div className={styles.buttonsContainer}>
            <Link to="/dashboard" className={styles.cancelButton}>
              Annuler
            </Link>
            <button type="submit" className={styles.addButton} disabled={isSubmitting}>
              {isSubmitting ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehiclePage;
