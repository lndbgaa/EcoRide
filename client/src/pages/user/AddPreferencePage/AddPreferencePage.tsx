import classNames from "classnames";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import PreferenceService from "@/services/PreferenceService";

import styles from "./AddPreferencePage.module.css";

const AddPreferencePage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [label, setLabel] = useState<string>("");

  const navigate = useNavigate();

  const validateLabel = (label: string): boolean => {
    setError("");

    if (!label) {
      setError("Veuillez entrer une préférence");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    if (isSubmitting) return;

    e.preventDefault();

    setIsSubmitting(true);

    const cleanedLabel = label.trim();

    const isValid = validateLabel(cleanedLabel);

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await PreferenceService.addPreference(cleanedLabel);
      toast.success("Préférence ajoutée avec succès");
      navigate("/dashboard");
    } catch {
      toast.error("Erreur lors de l'ajout de la préférence");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.addPreferenceContainer}>
        <h1 className={styles.title}>Ajouter une préférence</h1>

        <form noValidate onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="label" className="sr-only">
              Préférence
            </label>
            <input
              type="text"
              id="label"
              name="label"
              className={classNames(styles.input, { [styles.hasError]: error })}
              placeholder="ex: Je préfère voyager en silence"
              value={label}
              autoComplete="off"
              onChange={(e) => setLabel(e.target.value)}
              aria-invalid={!!error}
              aria-describedby="label-error"
            />
            {error && (
              <div id="label-error" className={styles.inputErrorMessage}>
                {error}
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

export default AddPreferencePage;
