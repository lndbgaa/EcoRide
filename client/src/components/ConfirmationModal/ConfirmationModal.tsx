import styles from "./ConfirmationModal.module.css";

interface ButtonStyles {
  color: string;
  backgroundColor: string;
  hoverBackgroundColor: string;
  hoverColor: string;
}

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmButtonStyles?: ButtonStyles;
  confirmButtonText?: string;
  cancelButtonStyles?: ButtonStyles;
  cancelButtonText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({
  title,
  message,
  cancelButtonText = "Annuler",
  cancelButtonStyles = {
    color: "var(--clr-text-primary)",
    hoverColor: "var(--clr-white)",
    backgroundColor: "var(--clr-soft-gray)",
    hoverBackgroundColor: "var(--clr-medium-gray)",
  },
  confirmButtonText = "Confirmer",
  confirmButtonStyles = {
    color: "var(--clr-white)",
    hoverColor: "var(--clr-white)",
    backgroundColor: "var(--clr-accent)",
    hoverBackgroundColor: "var(--clr-accent-dark)",
  },

  onCancel,
  onConfirm,
}: ConfirmationModalProps) => {
  const { color, backgroundColor, hoverBackgroundColor } = confirmButtonStyles;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} role="dialog">
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtons}>
          <button
            className={styles.modalCancelButton}
            onClick={onCancel}
            style={{
              backgroundColor: cancelButtonStyles.backgroundColor,
              color: cancelButtonStyles.color,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = cancelButtonStyles.hoverBackgroundColor;
              e.currentTarget.style.color = cancelButtonStyles.hoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = cancelButtonStyles.backgroundColor;
              e.currentTarget.style.color = cancelButtonStyles.color;
            }}
          >
            {cancelButtonText}
          </button>

          <button
            className={styles.modalConfirmButton}
            onClick={onConfirm}
            style={{
              backgroundColor,
              color,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = hoverBackgroundColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = backgroundColor;
            }}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
