import classNames from "classnames";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";

import useAuth from "@/hooks/useAuth";

import { AxiosError } from "axios";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/search");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = "Ce champ est requis";
      isValid = false;
    } else if (!validator.isEmail(email)) {
      newErrors.email = "Oups ! Ce n’est pas un email valide. 😬";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Ce champ est requis";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    if (isLoading) return;

    e.preventDefault();
    setIsLoading(true);

    const isValid = validateForm();

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      await login({ email, password });
      navigate("/search");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        setError({ auth: message ?? "Erreur de connexion inattendue. Veuillez réessayer." });
      } else {
        setError({ auth: "Erreur de connexion inattendue. Veuillez réessayer." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.signin}>
          <h1 className={styles.title}>Connectez-vous</h1>
          {error.auth && (
            <div className={classNames(styles.errorMessage, styles.authError)} aria-live="polite">
              {error.auth}
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

            <button type="submit" className={styles.signinButton} disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Connexion"}
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
