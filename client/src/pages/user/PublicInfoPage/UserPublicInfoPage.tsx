import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import validator from "validator";

import RightArrow from "@/assets/images/arrow-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";

import Loader from "@/components/Loader/Loader";
import UserService from "@/services/UserService";

import styles from "./UserPublicInfoPage.module.css";

import type { User } from "@/types/UserTypes";

const UserPublicInfoPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      if (!id || !validator.isUUID(id)) {
        navigate("/error");
        return;
      }

      try {
        const user = await UserService.getUserInfo(id);
        setUser(user);
      } catch {
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  if (isLoading) return <Loader />;

  if (!user) return null;

  const { id: userId, firstName, pseudo, avatar, memberSince, averageRating } = user;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileContainer}>
        <div className={styles.profileInfoContainer}>
          <div className={styles.mainInfoContainer}>
            <div className={styles.avatarWrapper}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <img src={DefaultAvatar} alt="Avatar" className={styles.avatarImage} />
              )}
            </div>

            <div className={styles.nameContainer}>
              <p className={styles.userName}>{firstName}</p>
              <p className={styles.userPseudo}>@{pseudo}</p>
            </div>
          </div>

          <div className={styles.detailsContainer}>
            <p className={styles.memberSince}>Membre depuis le {dayjs(memberSince).format("DD/MM/YYYY")}</p>
            {/* TODO Implémenter fonctionnalité pour afficher le nombre de trajets effectués */}
            <p className={styles.ridesCount}>
              Trajets effectués: <span>{0}</span>
            </p>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Évaluations et avis</h2>

          <div className={styles.ratingContainer}>
            <div className={styles.ratingOverview}>
              <p className={styles.ratingScore}>{averageRating ? parseFloat(averageRating)?.toFixed(1) : "0.0"}</p>

              {/* TODO Implémenter fonctionnalité pour afficher le nombre d'avis total */}
              <p className={styles.ratingCount}>{averageRating ? `(- avis)` : "(Aucun avis)"}</p>
            </div>

            <Link to={`/user/${userId}/ratings`} className={styles.viewAllRatings}>
              Voir tous les avis
              <RightArrow />
            </Link>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Activités récentes</h2>
          {/* TODO Implémenter fonctionnalité pour afficher les activités récentes */}
          <p className={styles.activitySection}>Ce membre n'a pas d'activité récente à afficher.</p>
        </div>
      </div>
    </div>
  );
};

export default UserPublicInfoPage;
