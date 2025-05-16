import { Link } from "react-router-dom";

import styles from "./ErrorPage.module.css";

const ErrorPage = () => {
  // TODO: Implémenter la possibilité de réessayer l'action
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Erreur</h1>
        <p className={styles.message}>Oups ! On dirait que quelque chose s'est mal passé</p>
        <p className={styles.description}>
          Pas de panique, ça peut arriver. Revenez en arrière ou réessayez plus tard.
        </p>
        <Link to="/" className={styles.button}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
