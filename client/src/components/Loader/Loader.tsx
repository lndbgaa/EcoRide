import styles from "./Loader.module.css";

const Loader = ({ width = "7rem", height = "7rem" }: { width?: string; height?: string }) => {
  return (
    <div className={styles.loaderContainer}>
      <span className={styles.loader} style={{ width, height }}></span>
    </div>
  );
};

export default Loader;
