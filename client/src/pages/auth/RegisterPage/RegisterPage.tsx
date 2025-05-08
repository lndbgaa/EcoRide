import { AxiosError } from "axios";
import classNames from "classnames";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";

import useAuth from "@/hooks/useAuth";
import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    pseudo: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/search");
    }
  }, [isAuthenticated, navigate]);

  const validateData = (data: typeof formData) => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!data.firstName) {
      newErrors.firstName = "Champ requis";
      isValid = false;
    } else if (!/^[a-zA-Z- ]+$/.test(data.firstName)) {
      newErrors.firstName = "Invalide (lettres et tirets uniquement)";
      isValid = false;
    }

    if (!data.lastName) {
      newErrors.lastName = "Champ requis";
      isValid = false;
    } else if (!/^[a-zA-Z- ]+$/.test(data.lastName)) {
      newErrors.lastName = "Invalide (lettres et tirets uniquement)";
      isValid = false;
    }

    if (!data.email) {
      newErrors.email = "Champ requis";
      isValid = false;
    } else if (!validator.isEmail(data.email)) {
      newErrors.email = "Oups ! Ce n’est pas un email valide 😬";
      isValid = false;
    }

    if (!data.pseudo) {
      newErrors.pseudo = "Champ requis";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.pseudo)) {
      newErrors.pseudo = "Invalide (lettres, chiffres, tirets et underscores uniquement)";
      isValid = false;
    }

    if (!data.password) {
      newErrors.password = "Champ requis";
      isValid = false;
    } else if (data.password.length < 8) {
      newErrors.password = "Mot de passe trop court (8 caractères minimum)";
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(data.password)) {
      newErrors.password = "Invalide (1 min., 1 maj., 1 chiffre, 1 spécial)";
      isValid = false;
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Champ requis";
      isValid = false;
    }

    if (data.password !== data.confirmPassword && data.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isLoading) return;

    e.preventDefault();
    setIsLoading(true);

    const cleanedData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      pseudo: formData.pseudo.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      ...cleanedData,
    }));

    const isValid = validateData(cleanedData);

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      await register(cleanedData);
      navigate("/search");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        setError({ auth: message ?? "Erreur lors de l'inscription, veuillez réessayer." });
      } else {
        setError({ auth: "Erreur lors de l'inscription, veuillez réessayer." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.signup}>
          <h1 className={styles.title}>Inscrivez-vous</h1>
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
                  required
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
                  required
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
                required
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
              <label htmlFor="pseudo" className="sr-only">
                Pseudo
              </label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                className={classNames(styles.input, error.pseudo && styles.hasError)}
                value={formData.pseudo}
                placeholder="Pseudo"
                onChange={handleChange}
                required
                aria-invalid={!!error.pseudo}
                aria-describedby={error.pseudo ? "pseudoError" : undefined}
              />
              {error.pseudo && (
                <div id="pseudoError" className={classNames(styles.errorMessage, styles.inputError)} aria-live="polite">
                  {error.pseudo}
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
                required
                aria-invalid={!!error.password}
                aria-describedby={error.password ? "passwordError" : undefined}
              />
              {error.password && (
                <div
                  id="passwordError"
                  className={classNames(styles.errorMessage, styles.inputError)}
                  aria-live="polite"
                >
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
                required
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
            <button type="submit" className={styles.signupButton} disabled={isLoading}>
              {isLoading ? "Inscription en cours..." : "Inscription"}
            </button>
          </form>
        </div>
        <div className={styles.signin}>
          <p className={styles.signinText}>Déjà membre ?</p>
          <Link to="/login" className={styles.signinButton}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
