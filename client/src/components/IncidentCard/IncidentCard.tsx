import { useState } from "react";
import { toast } from "react-toastify";

import IncidentDetailsModal from "@/components/IncidentDetailsModal/IncidentDetailsModal";
import IncidentService from "@/services/IncidentService";
import { formatDateFr } from "@/utils/dateUtils";

import styles from "./IncidentCard.module.css";

import type { IncidentDetailed, IncidentPreview } from "@/types/IncidentTypes";

const IncidentCard = ({ data }: { data: IncidentPreview }) => {
  const { id: incidentId, description, createdAt } = data;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [incidentDetails, setIncidentDetails] = useState<IncidentDetailed | null>(null);

  const handleViewClick = async (e: React.MouseEvent) => {
    if (isLoading) return;
    e.preventDefault();

    setShowModal(true);
    setIsLoading(true);

    try {
      const response = await IncidentService.getIncidentDetails(incidentId);
      setIncidentDetails(response.data);
    } catch {
      toast.error("Une erreur est survenue lors de la récupération des informations de l'incident");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.incidentCard}>
        <p className={styles.incidentDate}>le {formatDateFr(createdAt)}</p>
        <div className={styles.divider}></div>
        <p className={styles.description}>« {description} »</p>
        <div className={styles.divider}></div>
        <button className={styles.viewButton} onClick={handleViewClick} disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Un instant..." : "Voir"}
        </button>
      </div>

      {showModal && incidentDetails && (
        <IncidentDetailsModal
          data={incidentDetails}
          onClose={() => {
            setShowModal(false);
            setIncidentDetails(null);
          }}
        />
      )}
    </>
  );
};

export default IncidentCard;
