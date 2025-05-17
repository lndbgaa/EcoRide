import classNames from "classnames";

import HandshakeIllustration from "@/assets/images/handshake-illustration.svg?react";
import HappyIllustration from "@/assets/images/happy-illustration.svg?react";
import PhoneIllustration from "@/assets/images/phone-illustration.svg?react";
import QuestionIllustration from "@/assets/images/question-illustration.svg?react";

import SearchForm from "@/components/SearchForm/SearchForm";

import styles from "./CarpoolPage.module.css";

const CarpoolPage = () => {
  return (
    <div className={styles.pageContainer}>
      {/* Section Hero */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Trouvez votre trajet éco-responsable</h1>
        <div className={styles.searchContainer}>
          <SearchForm />
        </div>
      </section>

      {/* Section de présentation */}
      <section className={styles.presentationSection}>
        <div className={styles.presentationContainer}>
          {/* Premier bloc de présentation */}
          <div className={classNames(styles.presentationBlock, styles.reverse)}>
            <div className={styles.imageContainer}>
              <QuestionIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Le covoiturage, c'est quoi ?</h2>
              <p className={styles.blockText}>
                Le covoiturage consiste à partager un trajet avec d’autres personnes se rendant dans la même direction.
                Grâce à <span className={styles.highlight}>EcoRide</span>, ce mode de transport devient simple, flexible
                et plus durable. C’est une solution idéale pour réduire les coûts, limiter l’impact écologique de ses
                déplacements et créer du lien social, tout en voyageant en toute sécurité.
              </p>
            </div>
          </div>

          {/* Deuxième bloc de présentation */}
          <div className={styles.presentationBlock}>
            <div className={styles.imageContainer}>
              <PhoneIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Comment ça marche ?</h2>
              <p className={styles.blockText}>
                C’est très simple : en tant que passager, vous entrez votre destination et choisissez un trajet proposé
                par un conducteur. En tant que conducteur, vous publiez votre trajet en précisant les horaires, le
                nombre de places disponibles et vos préférences. <span className={styles.highlight}>EcoRide</span>{" "}
                facilite la mise en relation, la réservation et le suivi de chaque covoiturage, en toute confiance.
              </p>
            </div>
          </div>

          {/* Troisième bloc de présentation */}
          <div className={classNames(styles.presentationBlock, styles.reverse)}>
            <div className={styles.imageContainer}>
              <HappyIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Les avantages du covoiturage</h2>
              <p className={styles.blockText}>
                Covoiturer avec <span className={styles.highlight}>EcoRide</span>, c’est faire le choix de la praticité
                et de l’engagement. Moins de frais, moins de stress, et beaucoup plus de convivialité ! En partageant un
                véhicule, vous contribuez à réduire les embouteillages, la pollution et votre empreinte carbone. C’est
                un geste simple, mais qui fait toute la différence au quotidien.
              </p>
            </div>
          </div>

          {/* Quatrième bloc de présentation */}
          <div className={styles.presentationBlock}>
            <div className={styles.imageContainer}>
              <HandshakeIllustration className={styles.illustration} />
            </div>
            <div className={styles.textContainer}>
              <h2 className={styles.blockTitle}>Notre engagement</h2>
              <p className={styles.blockText}>
                Chez <span className={styles.highlight}>EcoRide</span>, nous croyons en une mobilité plus responsable.
                Nous mettons en avant les conducteurs fiables, les véhicules économes – souvent électriques – et les
                comportements respectueux. Notre objectif : rendre le covoiturage accessible à tous, tout en participant
                activement à la transition écologique.
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

export default CarpoolPage;
