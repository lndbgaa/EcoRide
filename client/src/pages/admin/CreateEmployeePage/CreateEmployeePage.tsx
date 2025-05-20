import { AxiosError } from "axios";
import classNames from "classnames";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import AdminService from "@/services/AdminService";

import styles from "./CreateEmployeePage.module.css";

const CreateEmployeePage = () => {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const navigate = useNavigate();

  const validateData = (data: typeof formData) => {
    setError({});

    if (!/^[a-zA-Z- ]+$/.test(data.firstName)) {
      setError({ firstName: "Prénom invalide (lettres et tirets uniquement)" });
      return false;
    }

    if (!/^[a-zA-Z- ]+$/.test(data.lastName)) {
      setError({ lastName: "Nom invalide (lettres et tirets uniquement)" });
      return false;
    }

    if (!validator.isEmail(data.email)) {
      setError({ email: "Email invalide" });
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(data.password)) {
      setError({
        password:
          "Mot de passe invalide (au moins 8 caractères, avec une minuscule, une majuscule, un chiffre et un caractère spécial)",
      });
      return false;
    }

    if (!data.confirmPassword) {
      setError({ confirmPassword: "Veuillez confirmer le mot de passe" });
      return false;
    }

    if (data.password !== data.confirmPassword && data.confirmPassword) {
      setError({ confirmPassword: "Les mots de passe ne correspondent pas" });
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isSubmitting) return;

    e.preventDefault();
    setIsSubmitting(true);

    const cleanedData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
    };

    const isValid = validateData(cleanedData);

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await AdminService.createEmployee(cleanedData);
      navigate("/admin/dashboard");
      toast.success("Compte créé avec succès.");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        toast.error(message ?? "Erreur lors de la création du compte, veuillez réessayer.");
      } else {
        toast.error("Erreur lors de la création du compte, veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.registerContainer}>
        <h1 className={styles.title}>Créer un compte </h1>
        {error.auth && (
          <div className={classNames(styles.errorMessage, styles.authError)} aria-live="polite">
            {error.auth}
          </div>
        )}

        <form noValidate className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className="sr-only">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={classNames(styles.input, error.firstName && styles.hasError)}
                value={formData.firstName}
                placeholder="Prénom"
                onChange={handleChange}
                aria-invalid={!!error.firstName}
                aria-describedby={error.firstName ? "firstNameError" : undefined}
              />
              {error.firstName && (
                <div
                  id="firstNameError"
                  className={classNames(styles.errorMessage, styles.inputError)}
                  aria-live="polite"
                >
                  {error.firstName}
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className="sr-only">
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={classNames(styles.input, error.lastName && styles.hasError)}
                value={formData.lastName}
                placeholder="Nom"
                onChange={handleChange}
                aria-invalid={!!error.lastName}
                aria-describedby={error.lastName ? "lastNameError" : undefined}
              />
              {error.lastName && (
                <div
                  id="lastNameError"
                  className={classNames(styles.errorMessage, styles.inputError)}
                  aria-live="polite"
                >
                  {error.lastName}
                </div>
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={classNames(styles.input, error.email && styles.hasError)}
              value={formData.email}
              placeholder="Email"
              onChange={handleChange}
              aria-invalid={!!error.email}
              aria-describedby={error.email ? "emailError" : undefined}
            />
            {error.email && (
              <div id="emailError" className={classNames(styles.errorMessage, styles.inputError)} aria-live="polite">
                {error.email}
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className="sr-only">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={classNames(styles.input, error.password && styles.hasError)}
              value={formData.password}
              placeholder="Mot de passe"
              onChange={handleChange}
              minLength={8}
              aria-invalid={!!error.password}
              aria-describedby={error.password ? "passwordError" : undefined}
            />
            {error.password && (
              <div id="passwordError" className={classNames(styles.errorMessage, styles.inputError)} aria-live="polite">
                {error.password}
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={classNames(styles.input, error.confirmPassword && styles.hasError)}
              value={formData.confirmPassword}
              placeholder="Confirmer le mot de passe"
              onChange={handleChange}
              aria-invalid={!!error.confirmPassword}
              aria-describedby={error.confirmPassword ? "confirmPasswordError" : undefined}
            />
            {error.confirmPassword && (
              <div
                id="confirmPasswordError"
                className={classNames(styles.errorMessage, styles.inputError)}
                aria-live="polite"
              >
                {error.confirmPassword}
              </div>
            )}
          </div>
          <button type="submit" className={styles.createButton} disabled={isSubmitting}>
            {isSubmitting ? "Création en cours..." : "Créer employé"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeePage;
