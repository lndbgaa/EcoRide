import { Link } from "react-router-dom";

import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import RightArrow from "@/assets/images/right-arrow.svg?react";

import useUser from "@/hooks/useUser";
import styles from "./UserPublicInfoPage.module.css";

const UserPublicInfoPage = () => {
  const { user } = useUser();

  // Fonction pour générer les étoiles selon la note
  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null;

    const stars = [];
    const totalStars = 5;

    for (let i = 1; i <= totalStars; i++) {
      if (i <= Math.floor(rating)) {
        // Étoile pleine
        stars.push(
          <span key={i} className={styles.starFilled}>
            ★
          </span>
        );
      } else if (i - 0.5 <= rating) {
        // Demi-étoile (utilisons le caractère étoile pleine avec une couleur différente)
        stars.push(
          <span key={i} className={styles.starFilled}>
            ★
          </span>
        );
      } else {
        // Étoile vide
        stars.push(
          <span key={i} className={styles.starEmpty}>
            ☆
          </span>
        );
      }
    }

    return stars;
  };

  if (!user) {
    return <div className={styles.pageContainer}>Chargement...</div>;
  }

  // Valeurs par défaut pour les données qui ne sont pas dans l'interface User
  const completedTrips = 0; // Cette propriété n'existe pas dans l'interface User
  const ratingsCount = 0; // Cette propriété n'existe pas dans l'interface User

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.mainInfoContainer}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <img src={DefaultAvatar} alt="Avatar" className={styles.avatarImage} />
              )}
            </div>

            <div className={styles.nameContainer}>
              <h1 className={styles.userName}>{user.firstName}</h1>
              <p className={styles.userPseudo}>@{user.pseudo}</p>
            </div>
          </div>

          <div className={styles.detailsContainer}>
            <p className={styles.memberSince}>Membre depuis le {user.memberSince}</p>
            <div className={styles.infoItem}>
              <span>Trajets effectués: {completedTrips}</span>
            </div>

            {user.isDriver && (
              <div className={styles.infoItem}>
                <span className={styles.badge}>Conducteur</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Évaluations et avis</h2>

          <div className={styles.ratingContainer}>
            <div className={styles.ratingOverview}>
              <div className={styles.ratingScore}>{user.averageRating?.toFixed(1) || "-"}</div>

              <div className={styles.ratingDetails}>
                <div className={styles.starsContainer}>{renderStars(user.averageRating)}</div>
                <div className={styles.ratingCount}>{user.averageRating ? `${ratingsCount} avis` : "Aucun avis"}</div>
              </div>
            </div>

            <Link to={`/user/${user.id}/ratings`} className={styles.viewAllRatings}>
              Voir tous les avis
              <RightArrow />
            </Link>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Activités récentes</h2>
          <p className={styles.activitySection}>Ce membre n'a pas d'activité récente à afficher.</p>
        </div>
      </div>
    </div>
  );
};

export default UserPublicInfoPage;
