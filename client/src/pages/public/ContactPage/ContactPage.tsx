import classNames from "classnames";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ClockIcon from "@/assets/images/clock-icon.svg?react";
import EmailIcon from "@/assets/images/email-icon.svg?react";
import LocationIcon from "@/assets/images/location-icon.svg?react";
import PhoneIcon from "@/assets/images/phone-icon.svg?react";

import useUser from "@/hooks/useUser";

import styles from "./ContactPage.module.css";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage = () => {
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const validateForm = (data: ContactFormData) => {
    setError({});

    const { firstName, lastName, email, subject, message } = data;

    if (!firstName.trim()) {
      setError({ firstName: "Veuillez entrer votre prénom." });
      return false;
    }

    if (!lastName.trim()) {
      setError({ lastName: "Veuillez entrer votre nom." });
      return false;
    }

    if (!email.trim()) {
      setError({ email: "Veuillez entrer votre email." });
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError({ email: "Veuillez entrer un email valide." });
      return false;
    }

    if (!subject.trim()) {
      setError({ subject: "Veuillez entrer un sujet." });
      return false;
    }

    if (!message.trim()) {
      setError({ message: "Veuillez entrer votre message." });
      return false;
    } else if (message.trim().length < 10) {
      setError({ message: "Veuillez développer votre message (minimum 10 caractères)." });
      return false;
    } else if (message.trim().length > 1000) {
      setError({ message: "Veuillez réduire votre message (maximum 500 caractères)." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (isSubmitting) return;

    e.preventDefault();

    const cleanedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    const isValid = validateForm(cleanedData);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // TODO: Mettre en place l'envoi du message (envoi d'un email)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));

      toast.success("Votre message a été envoyé avec succès.");
    } catch {
      toast.error("Une erreur est survenue lors de l'envoi de votre message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }));
    }
  }, [user]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contactContainer}>
        <h1 className={styles.title}>Contactez-nous</h1>

        <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={classNames(styles.inputField, {
                [styles.hasError]: error.firstName,
              })}
              value={formData.firstName}
              placeholder="Prénom"
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              aria-invalid={!!error.firstName}
              aria-describedby={error.firstName ? "firstNameError" : undefined}
            />
            {error.firstName && (
              <div id="firstNameError" className={styles.inputErrorMessage} aria-live="polite">
                {error.firstName}
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={classNames(styles.inputField, {
                [styles.hasError]: error.lastName,
              })}
              placeholder="Votre nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              aria-invalid={!!error.lastName}
              aria-describedby="lastName-error"
            />
            {error.lastName && (
              <div id="lastNameError" className={styles.inputErrorMessage} aria-live="polite">
                {error.lastName}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={classNames(styles.inputField, {
                [styles.hasError]: error.email,
              })}
              placeholder="votre.email@exemple.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              aria-invalid={!!error.email}
              aria-describedby="email-error"
            />
            {error.email && (
              <p className={styles.inputErrorMessage} id="email-error">
                {error.email}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subject" className={styles.label}>
              Sujet
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className={classNames(styles.inputField, {
                [styles.hasError]: error.subject,
              })}
              placeholder="Sujet de votre message"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              aria-invalid={!!error.subject}
              aria-describedby="subject-error"
            />
            {error.subject && (
              <p className={styles.inputErrorMessage} id="subject-error">
                {error.subject}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className={classNames(styles.textareaField, {
                [styles.hasError]: error.message,
              })}
              placeholder="Votre message"
              maxLength={500}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              aria-invalid={!!error.message}
              aria-describedby="message-error"
            />
            {error.message && (
              <p className={styles.inputErrorMessage} id="message-error">
                {error.message}
              </p>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Envoyer"}
          </button>
        </form>

        <div className={styles.contactInfo}>
          <p className={styles.contactInfoTitle}>Nos informations</p>

          <div className={styles.contactItem}>
            <EmailIcon className={styles.contactIcon} />
            <p>
              Email: <span>contact@ecoride.fr</span>
            </p>
          </div>

          <div className={styles.contactItem}>
            <PhoneIcon className={styles.contactIcon} />
            <p>
              Téléphone: <span>+33 1 23 45 67 89</span>
            </p>
          </div>

          <div className={styles.contactItem}>
            <LocationIcon className={styles.contactIcon} />
            <p>
              Adresse: <span>Rue du covoiturage, 75000 Paris</span>
            </p>
          </div>

          <div className={styles.contactItem}>
            <ClockIcon className={styles.contactIcon} />
            <p>
              Horaires: <span>Lundi au Vendredi, 9h00 - 18h00</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
