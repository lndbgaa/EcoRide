import classNames from "classnames";

import CommunityIllustration from "@/assets/images/community-illustration.svg?react";
import EcoIllustration from "@/assets/images/eco-illustration.svg?react";
import RideIllustration from "@/assets/images/ride-illustration.svg?react";

import SearchForm from "@/components/SearchForm/SearchForm";

import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={styles.pageContainer}>
      {/* Section Hero avec le formulaire de recherche */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Partageons la route, préservons la planète.</h1>
        <div className={styles.searchContainer}>
          <SearchForm />
        </div>
      </section>

      {/* Section de présentation */}
      <section className={styles.presentationSection}>
        <div className={styles.presentationContainer}>
          {/* Premier bloc de présentation */}
          <div className={styles.presentationBlock}>
            <div className={styles.imageContainer}>
              <EcoIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Voyagez de manière éco-responsable</h2>
              <p className={styles.blockText}>
                Avec <span className={styles.highlight}>EcoRide</span>, chaque trajet compte pour la planète. Optez pour
                un mode de transport partagé, pensé pour limiter les émissions de CO₂, et laissez-vous porter par une
                mobilité plus propre, souvent électrique, toujours engagée. Ensemble, contribuons à un avenir plus
                durable.
              </p>
            </div>
          </div>

          {/* Deuxième bloc de présentation */}
          <div className={classNames(styles.presentationBlock, styles.reverse)}>
            <div className={styles.imageContainer}>
              <CommunityIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Une communauté de voyageurs engagés</h2>
              <p className={styles.blockText}>
                Rejoignez une communauté soucieuse de son impact et animée par des valeurs communes. Avec{" "}
                <span className={styles.highlight}>EcoRide</span>, nos utilisateurs partagent bien plus qu’un simple
                trajet : ils participent à un mouvement pour un transport plus humain, solidaire et respectueux de
                l’environnement. Chaque voyage devient l’occasion de créer du lien, d’encourager les bonnes pratiques et
                de construire ensemble une nouvelle manière de se déplacer.
              </p>
            </div>
          </div>

          {/* Troisième bloc de présentation */}
          <div className={styles.presentationBlock}>
            <div className={styles.imageContainer}>
              <RideIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Des trajets adaptés à vos besoins</h2>
              <p className={styles.blockText}>
                <span className={styles.highlight}>EcoRide</span> s’adapte à votre quotidien en vous proposant des
                trajets flexibles, pensés pour votre confort. Grâce à une sélection de conducteurs évalués par la
                communauté et un service centré sur la sécurité et la fiabilité, vous voyagez en toute confiance, selon
                votre emploi du temps et vos préférences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.contactInfo}>
            <p className={styles.contactEmail}>contact@ecoride.fr</p>
          </div>
          <a href="/mentions-legales" className={styles.legalLink}>
            Mentions légales
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
