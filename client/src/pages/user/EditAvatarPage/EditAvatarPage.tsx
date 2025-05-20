import { FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useUser from "@/hooks/useUser";

import styles from "./EditAvatarPage.module.css";

const EditAvatarPage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { updateAvatar } = useUser();

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILE_SIZE_MB = 5;
    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Le fichier doit être au format JPEG, PNG ou WEBP uniquement");
      return false;
    }

    if (file.size === 0) {
      setError("Veuillez sélectionner une image");
      return false;
    }

    if (file.size > maxSize) {
      setError(`La taille de l'image ne doit pas dépasser ${MAX_FILE_SIZE_MB} MB`);
      return false;
    }

    return true;
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError("");
      } else {
        e.target.value = "";
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isSubmitting) return;

    e.preventDefault();

    if (!selectedFile) {
      setError("Veuillez sélectionner une image");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateAvatar(selectedFile);
      toast.success("Photo de profil mise à jour avec succès");
      navigate("/dashboard");
    } catch {
      toast.error("Erreur lors de la mise à jour de la photo de profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.editAvatarContainer}>
        <h1 className={styles.title}>Modifier votre photo de profil</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form noValidate onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="file"
              id="avatar"
              name="avatar"
              ref={fileInputRef}
              className={styles.fileInput}
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
            <div className={styles.customFileInput}>
              <div className={styles.fileNameContainer}>
                <span className={styles.fileName}>
                  {selectedFile ? selectedFile.name : "Aucun fichier sélectionné"}
                </span>
              </div>
              <button type="button" className={styles.browseButton} onClick={handleBrowseClick}>
                Parcourir
              </button>
            </div>
          </div>

          <div className={styles.buttonsContainer}>
            <Link to="/dashboard" className={styles.cancelButton}>
              Annuler
            </Link>
            <button type="submit" className={styles.editButton} disabled={isSubmitting || !selectedFile}>
              {isSubmitting ? "Modification en cours..." : "Modifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAvatarPage;
