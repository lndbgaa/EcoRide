import useAuth from "@/hooks/useAuth";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AxiosError } from "axios";
import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [error, setError] = useState("");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isLoading) return;
    e.preventDefault();
    setError("");

    // Vérification du mot de passe
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const { email, pseudo, password, firstName, lastName } = formData;
      await register({ email, pseudo, password, firstName, lastName });
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        setError(error.response?.data?.message);
      } else if (error instanceof AxiosError && error.response?.data?.errors) {
        setError(error.response?.data?.errors[0]);
      } else {
        setError("Erreur lors de l'inscription, veuillez réessayer");
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
          {error && (
            <div className={styles.errorMessage} aria-live="polite">
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className="sr-only">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={styles.input}
                  value={formData.firstName}
                  placeholder="Prénom"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName" className="sr-only">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={styles.input}
                  value={formData.lastName}
                  placeholder="Nom"
                  onChange={handleChange}
                  required
                />
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
                className={styles.input}
                value={formData.email}
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="pseudo" className="sr-only">
                Pseudo
              </label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                className={styles.input}
                value={formData.pseudo}
                placeholder="Pseudo"
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.input}
                value={formData.password}
                placeholder="Mot de passe"
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={styles.input}
                value={formData.confirmPassword}
                placeholder="Confirmer le mot de passe"
                onChange={handleChange}
                required
              />
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
