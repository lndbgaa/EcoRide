import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import Loader from "@/components/Loader/Loader";
import VehicleService from "@/services/VehicleService";

import styles from "./ShowVehiclePage.module.css";

import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import type { Vehicle } from "@/types/VehicleTypes";

const ShowVehiclePage = () => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      await VehicleService.deleteVehicle(id);
      setShowDeleteModal(false);
      toast.success("Véhicule supprimé avec succès");
      navigate("/dashboard");
    } catch {
      setShowDeleteModal(false);
      toast.error("Une erreur est survenue lors de la suppression du véhicule.");
    }
  };

  useEffect(() => {
    if (!id || !validator.isUUID(id)) {
      navigate("/error");
      return;
    }

    const fetchVehicle = async (): Promise<void> => {
      try {
        const vehicle = await VehicleService.getVehicle(id);
        setVehicle(vehicle);
      } catch {
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);

  if (isLoading) return <Loader />;

  if (!vehicle) return null;

  const { brand, model, color, energy, seats, licensePlate, firstRegistration } = vehicle;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.vehicleContainer}>
        <h1 className={styles.title}>Mon véhicule</h1>

        <div className={styles.infoContainer}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Marque</span>
            <span className={styles.infoValue}>{brand}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Modèle</span>
            <span className={styles.infoValue}>{model}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Couleur</span>
            <span className={styles.infoValue}>{color}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Energie</span>
            <span className={styles.infoValue}>{energy}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nombre de places</span>
            <span className={styles.infoValue}>{seats}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Plaque d'immatriculation</span>
            <span className={styles.infoValue}>{licensePlate}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Première immatriculation</span>
            <span className={styles.infoValue}>{firstRegistration}</span>
          </div>
        </div>

        <div className={styles.buttons}>
          <Link to="/dashboard" className={styles.backButton}>
            Retour
          </Link>

          {/*<Link to={`/vehicle/${mockVehicle.id}/edit`} className={`${styles.button} ${styles.editButton}`}>
            Modifier
          </Link>*/}

          <button className={styles.deleteButton} onClick={handleDeleteClick}>
            Supprimer
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          title="Confirmation de suppression"
          message="Êtes-vous sûr de vouloir supprimer ce véhicule ?"
          confirmButtonText="Supprimer"
          confirmButtonStyles={{
            color: "var(--clr-white)",
            hoverColor: "var(--clr-white)",
            backgroundColor: "var(--clr-error)",
            hoverBackgroundColor: "var(--clr-error-dark)",
          }}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ShowVehiclePage;
