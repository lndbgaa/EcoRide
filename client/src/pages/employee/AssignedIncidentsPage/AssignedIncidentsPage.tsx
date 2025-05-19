import { useEffect, useState } from "react";

import EmptyIllustration from "@/assets/images/empty-illustration.svg?react";
import TreeIllustration from "@/assets/images/tree-illustration.svg?react";
import IncidentCard from "@/components/IncidentCard/IncidentCard";
import Loader from "@/components/Loader/Loader";

import EmployeeService from "@/services/EmployeeService";

import styles from "./AssignedIncidentsPage.module.css";

import type { IncidentPreview } from "@/types/IncidentTypes";

const AssignedIncidentsPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [incidents, setIncidents] = useState<IncidentPreview[]>([]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(false);

    try {
      const response = await EmployeeService.getAssignedIncidents();
      setIncidents(response.data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <TreeIllustration className={styles.illustration} />
          <p className={styles.error}>Erreur lors du chargement des incidents.</p>
          <button onClick={fetchIncidents} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.incidentsList}>
        {incidents.length === 0 ? (
          <div className={styles.noIncidentsContainer}>
            <EmptyIllustration className={styles.illustration} />
            <p>Vous n'avez pas d'incident assigné.</p>
          </div>
        ) : (
          incidents.map((incident) => <IncidentCard key={incident.id} data={incident} />)
        )}
      </div>
    </div>
  );
};

export default AssignedIncidentsPage;
