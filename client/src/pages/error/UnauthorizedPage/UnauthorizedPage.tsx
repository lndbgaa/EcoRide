import { Link } from "react-router-dom";

import styles from "./UnauthorizedPage.module.css";

const UnauthorizedPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>403</h1>
        <p className={styles.message}>Accès non autorisé</p>
        <p className={styles.description}>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/" className={styles.button}>
          Aller à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
