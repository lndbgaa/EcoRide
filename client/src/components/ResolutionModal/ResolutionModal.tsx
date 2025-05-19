import classNames from "classnames";
import { useState } from "react";
import styles from "./ResolutionModal.module.css";

import type { IncidentResolution } from "@/types/IncidentTypes";

interface ResolutionModalProps {
  onClose: () => void;
  onConfirm: (data: IncidentResolution) => Promise<void>;
  isSubmitting: boolean;
}

const ResolutionModal = ({ onClose, onConfirm, isSubmitting }: ResolutionModalProps) => {
  const [resolutionNote, setResolutionNote] = useState<string>("");
  const [error, setError] = useState<{ [key: string]: string }>({});

  const validateForm = (data: { resolutionNote: string }) => {
    setError({});

    if (!data.resolutionNote.trim()) {
      setError({ resolutionNote: "Veuillez fournir une note de résolution" });
      return false;
    } else if (data.resolutionNote.length < 10) {
      setError({ resolutionNote: "Votre note de résolution est un peu courte. Minimum 10 caractères." });
      return false;
    } else if (data.resolutionNote.length > 500) {
      setError({ resolutionNote: "Votre note de résolution est trop longue. Maximum 500 caractères autorisés." });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isSubmitting) return;

    e.preventDefault();

    const cleanedData = {
      resolutionNote: resolutionNote.trim(),
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) return;

    onConfirm(cleanedData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Note de résolution</h2>
        <form noValidate onSubmit={handleSubmit} className={styles.resolutionForm}>
          <textarea
            className={classNames(styles.resolutionInput, error.resolutionNote && styles.hasError)}
            value={resolutionNote}
            minLength={10}
            maxLength={500}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Décrivez les actions prises pour résoudre l'incident..."
            required
          />
          {error.resolutionNote && <p className={styles.inputErrorMessage}>{error.resolutionNote}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className={styles.confirmButton} disabled={isSubmitting}>
              {isSubmitting ? "En cours..." : "Confirmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolutionModal;
