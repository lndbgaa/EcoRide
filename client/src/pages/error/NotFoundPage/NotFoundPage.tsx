import { Link } from "react-router-dom";

import styles from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Page non trouvée</p>
        <p className={styles.description}>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className={styles.button}>
          Aller à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
