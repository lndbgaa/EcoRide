import { AxiosError } from "axios";
import classNames from "classnames";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import validator from "validator";

import useAuth from "@/hooks/useAuth";

import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { role } = useAuth();

  const redirect = useCallback(() => {
    return role === "employee"
      ? navigate("/employee/dashboard")
      : role === "admin"
      ? navigate("/admin/dashboard")
      : navigate("/search");
  }, [role, navigate]);

  useEffect(() => {
    if (isAuthenticated) redirect();
  }, [isAuthenticated, redirect]);

  const validateFormData = (): boolean => {
    setError({});

    if (!email) {
      setError({ email: "Champ requis" });
      return false;
    } else if (!validator.isEmail(email)) {
      setError({ email: "Oups ! Ce n’est pas un email valide. 😬" });
      return false;
    }

    if (!password) {
      setError({ password: "Champ requis" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isSubmitting) return;

    e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateFormData();

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await login({ email, password });
      redirect();
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        toast.error(message ?? "Erreur de connexion inattendue. Veuillez réessayer.");
      } else {
        toast.error("Erreur de connexion inattendue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.signin}>
          <h1 className={styles.title}>Connectez-vous</h1>
          {error.submitLogin && (
            <div className={classNames(styles.errorMessage, styles.authError)} aria-live="polite">
              {error.submitLogin}
            </div>
          )}
          <form noValidate className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              {error.email && (
                <div id="emailError" className={classNames(styles.errorMessage, styles.inputError)} aria-live="polite">
                  {error.email}
                </div>
              )}
              <input
                type="email"
                id="email"
                name="email"
                className={classNames(styles.input, error.email && styles.hasError)}
                value={email}
                placeholder="Email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError((prev) => ({ ...prev, email: "" }));
                }}
                required
                aria-invalid={!!error.email}
                aria-describedby={error.email ? "emailError" : undefined}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              {error.password && (
                <div
                  id="passwordError"
                  className={classNames(styles.errorMessage, styles.inputError)}
                  aria-live="polite"
                >
                  {error.password}
                </div>
              )}
              <input
                type="password"
                id="password"
                name="password"
                className={classNames(styles.input, error.password && styles.hasError)}
                value={password}
                placeholder="Mot de passe"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError((prev) => ({ ...prev, password: "" }));
                }}
                required
                aria-invalid={!!error.password}
                aria-describedby={error.password ? "passwordError" : undefined}
              />
              <Link to="" className={styles.forgotPassword}>
                Mot de passe oublié
              </Link>
            </div>

            <button type="submit" className={styles.signinButton} disabled={isSubmitting}>
              {isSubmitting ? "Connexion en cours..." : "Connexion"}
            </button>
          </form>
        </div>

        <div className={styles.signup}>
          <p className={styles.signupText}>Pas encore membre ?</p>
          <Link to="/register" className={styles.signupButton}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
