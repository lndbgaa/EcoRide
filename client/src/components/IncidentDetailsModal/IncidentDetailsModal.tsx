import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import CrossIcon from "@/assets/images/cross-icon.svg?react";

import ResolutionModal from "@/components/ResolutionModal/ResolutionModal";
import IncidentService from "@/services/IncidentService";
import { formatDateFr, formatFullDateFr } from "@/utils/dateUtils";
import styles from "./IncidentDetailsModal.module.css";

import type { IncidentDetailed, IncidentResolution } from "@/types/IncidentTypes";

interface IncidentDetailsModalProps {
  data: IncidentDetailed;
  onClose: () => void;
}

const IncidentDetailsModal = ({ data, onClose }: IncidentDetailsModalProps) => {
  const { id: incidentId, createdAt, status, description, ride, driver, passenger } = data;
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [showResolutionModal, setShowResolutionModal] = useState<boolean>(false);

  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleTakeCharge = async (): Promise<void> => {
    if (isAssigning) return;

    setIsAssigning(true);

    try {
      await IncidentService.assignIncident(incidentId);
      toast.success("L'incident vous a été assigné avec succès");
      onClose();
    } catch {
      toast.error("Une erreur est survenue lors de l'assignation de l'incident");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = async (resolutionData: IncidentResolution): Promise<void> => {
    if (isClosing) return;

    setIsClosing(true);

    try {
      await IncidentService.closeIncident(incidentId, resolutionData);
      toast.success("L'incident a été clôturé avec succès");
      onClose();
    } catch {
      toast.error("Une erreur est survenue lors de la clôture de l'incident");
    } finally {
      setIsClosing(false);
    }
  };

  useEffect(() => {
    if (showResolutionModal) {
      document.body.style.overflow = "hidden";
      if (modalContentRef.current) {
        modalContentRef.current.style.overflow = "hidden";
        modalContentRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "auto";
      if (modalContentRef.current) {
        modalContentRef.current.style.overflow = "auto";
      }
    }
  }, [showResolutionModal]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} ref={modalContentRef}>
        <button className={styles.closeButton} onClick={onClose}>
          <CrossIcon className={styles.closeIcon} />
        </button>

        <h2 className={styles.modalTitle}>Détails de l'incident</h2>

        <div className={styles.incidentInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Date de création</span>
            <span className={styles.infoValue}>{formatDateFr(createdAt)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Statut</span>
            <span className={`${styles.infoValue} ${styles[status]}`}>
              {status === "pending" && "En attente"}
              {status === "assigned" && "Assigné"}
              {status === "resolved" && "Résolu"}
            </span>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Trajet concerné</h3>
            <div className={styles.rideSummary}>
              <p className={styles.rideId}>{ride.id}</p>
              <p className={styles.locationText}>
                {ride.departureLocation} → {ride.arrivalLocation}
              </p>
              <p className={styles.departureDate}>{formatFullDateFr(ride.departureDate)}</p>
              <p className={styles.timeInfo}>
                {ride.departureTime} → {ride.arrivalTime}
              </p>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Personnes impliquées</h3>
            <div className={styles.peopleInfo}>
              <div className={styles.person}>
                <p className={styles.personLabel}>Conducteur</p>
                <div className={styles.personDetails}>
                  <p className={styles.personId}>{driver.id}</p>
                  <p className={styles.personPseudo}>{driver.pseudo}</p>
                  <p className={styles.personEmail}>{driver.email}</p>
                </div>
              </div>
              <div className={styles.person}>
                <p className={styles.personLabel}>Passager</p>
                <div className={styles.personDetails}>
                  <p className={styles.personId}>{passenger.id}</p>
                  <p className={styles.personPseudo}>{passenger.pseudo}</p>
                  <p className={styles.personEmail}>{passenger.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {status !== "resolved" && (
          <div className={styles.buttonContainer}>
            {status === "pending" && (
              <button className={styles.takeChargeButton} onClick={handleTakeCharge} disabled={isAssigning}>
                {isAssigning ? "En cours..." : "Prendre en charge"}
              </button>
            )}

            {status === "assigned" && (
              <button className={styles.resolveButton} onClick={() => setShowResolutionModal(true)}>
                Clôturer
              </button>
            )}
          </div>
        )}

        {showResolutionModal && (
          <ResolutionModal
            onClose={() => setShowResolutionModal(false)}
            onConfirm={handleClose}
            isSubmitting={isClosing}
          />
        )}
      </div>
    </div>
  );
};

export default IncidentDetailsModal;
