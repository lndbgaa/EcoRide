import classNames from "classnames";
import dayjs from "dayjs";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Loader from "@/components/Loader/Loader";
import useAccount from "@/hooks/useAccount";
import useUser from "@/hooks/useUser";

import styles from "./EditInfoPage.module.css";

import type { UpdateUserInfo, User } from "@/types/UserTypes";

const EditInfoPage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [pseudo, setPseudo] = useState<string>("");
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);

  const { account, isLoading: isUserLoading } = useAccount();
  const user = account as User | null;

  const { updateInfo } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPseudo(user.pseudo);
      setPhone(user.phone ?? null);
      setAddress(user.address ?? null);
      setBirthDate(user.birthDate ?? null);
    }
  }, [user]);

  const validateForm = (data: UpdateUserInfo): boolean => {
    setError({});

    if ("firstName" in data && typeof data.firstName === "string" && !/^[a-zA-Z- ]+$/.test(data.firstName)) {
      setError({ firstName: "Prénom invalide (lettres et tirets uniquement)" });
      return false;
    }

    if ("lastName" in data && typeof data.lastName === "string" && !/^[a-zA-Z- ]+$/.test(data.lastName)) {
      setError({ lastName: "Nom invalide (lettres et tirets uniquement)" });
      return false;
    }

    if ("pseudo" in data && typeof data.pseudo === "string" && !/^[a-zA-Z0-9_-]+$/.test(data.pseudo)) {
      setError({ pseudo: "Pseudo invalide (lettres, chiffres, tirets et underscores uniquement)" });
      return false;
    }

    if (
      "phone" in data &&
      typeof data.phone === "string" &&
      !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(data.phone)
    ) {
      setError({ phone: "Numéro de téléphone invalide (Format: 06XXXXXXXX)" });
      return false;
    }

    if (
      "birthDate" in data &&
      typeof data.birthDate === "string" &&
      (!dayjs(data.birthDate, "YYYY-MM-DD").isValid() ||
        dayjs(data.birthDate, "YYYY-MM-DD").isAfter(dayjs().subtract(1, "day")))
    ) {
      setError({ birthDate: "Date de naissance invalide" });
      return false;
    } else if (
      "birthDate" in data &&
      typeof data.birthDate === "string" &&
      dayjs(data.birthDate, "YYYY-MM-DD").isAfter(dayjs().subtract(18, "year"))
    ) {
      setError({ birthDate: "Vous devez être majeur (+18 ans)" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isSubmitting) return;

    e.preventDefault();

    setIsSubmitting(true);

    const cleanedData: UpdateUserInfo = {};

    if (firstName.trim() !== user?.firstName) {
      cleanedData.firstName = firstName.trim();
    }

    if (lastName.trim() !== user?.lastName) {
      cleanedData.lastName = lastName.trim();
    }

    if (pseudo.trim() !== user?.pseudo) {
      cleanedData.pseudo = pseudo.trim();
    }

    if (phone && phone.trim() !== user?.phone) {
      cleanedData.phone = phone.trim();
    }

    if (address && address.trim() !== user?.address) {
      cleanedData.address = address.trim();
    }

    if (birthDate && birthDate !== user?.birthDate) {
      cleanedData.birthDate = birthDate;
    }

    if (Object.keys(cleanedData).length === 0) {
      toast.info("Aucune modification détectée");
      setError({});
      setIsSubmitting(false);
      return;
    }

    const isValid = validateForm(cleanedData);

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await updateInfo(cleanedData);
      toast.success("Vos informations ont été mises à jour avec succès");
      navigate("/dashboard");
    } catch {
      toast.error("Une erreur est survenue lors de la mise à jour de vos informations");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) return <Loader />;

  const maxDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  return (
    <div className={styles.pageContainer}>
      <div className={styles.updateInfoContainer}>
        <h1 className={styles.title}>Modifier mon profil</h1>

        <form noValidate className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            {/* Prénom */}
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={classNames(styles.input, error.firstName && styles.hasError)}
                value={firstName}
                placeholder="ex: John"
                onChange={(e) => setFirstName(e.target.value)}
                aria-invalid={!!error.firstName}
                aria-describedby="firstName-error"
              />
              {error.firstName && (
                <div className={styles.inputErrorMessage} id="firstName-error">
                  {error.firstName}
                </div>
              )}
            </div>

            {/* Nom */}
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Nom
              </label>

              <input
                type="text"
                id="lastName"
                name="lastName"
                className={classNames(styles.input, error.lastName && styles.hasError)}
                value={lastName}
                placeholder="ex: Doe"
                onChange={(e) => setLastName(e.target.value)}
                aria-invalid={!!error.lastName}
                aria-describedby="lastName-error"
              />
              {error.lastName && (
                <div className={styles.inputErrorMessage} id="lastName-error">
                  {error.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Pseudo */}
          <div className={styles.formGroup}>
            <label htmlFor="pseudo" className={styles.label}>
              Pseudo
            </label>

            <input
              type="text"
              id="pseudo"
              name="pseudo"
              className={classNames(styles.input, error.pseudo && styles.hasError)}
              value={pseudo}
              placeholder="ex: JohnDoe_123"
              onChange={(e) => setPseudo(e.target.value)}
              aria-invalid={!!error.pseudo}
              aria-describedby="pseudo-error"
            />
            {error.pseudo && (
              <div className={styles.inputErrorMessage} id="pseudo-error">
                {error.pseudo}
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Téléphone
            </label>

            <input
              type="tel"
              id="phone"
              name="phone"
              className={classNames(styles.input, error.phone && styles.hasError)}
              value={phone ?? ""}
              placeholder="ex: 06XXXXXXXX"
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!error.phone}
              aria-describedby="phone-error"
            />
            {error.phone && (
              <div className={styles.inputErrorMessage} id="phone-error">
                {error.phone}
              </div>
            )}
          </div>

          {/* Adresse */}
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Adresse
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={classNames(styles.input, error.address && styles.hasError)}
              value={address ?? ""}
              placeholder="ex: 123 Rue de la Paix, Paris, France"
              onChange={(e) => setAddress(e.target.value)}
              aria-invalid={!!error.address}
              aria-describedby="address-error"
            />
            {error.address && (
              <div className={styles.inputErrorMessage} id="address-error">
                {error.address}
              </div>
            )}
          </div>

          {/* Date de naissance */}
          <div className={styles.formGroup}>
            <label htmlFor="birthDate" className={styles.label}>
              Date de naissance
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              className={classNames(styles.input, error.birthDate && styles.hasError)}
              value={birthDate ?? ""}
              max={maxDate}
              onChange={(e) => setBirthDate(e.target.value)}
              aria-invalid={!!error.birthDate}
              aria-describedby="birthDate-error"
            />
            {error.birthDate && (
              <div className={styles.inputErrorMessage} id="birthDate-error">
                {error.birthDate}
              </div>
            )}
          </div>

          <div className={styles.buttonsContainer}>
            <Link to="/dashboard" className={classNames(styles.button, styles.cancelButton)}>
              Annuler
            </Link>
            <button type="submit" className={classNames(styles.button, styles.updateButton)} disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInfoPage;
