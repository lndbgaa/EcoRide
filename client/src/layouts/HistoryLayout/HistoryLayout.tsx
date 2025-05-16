import { NavLink, Outlet } from "react-router-dom";
import styles from "./HistoryLayout.module.css";

const HistoryLayout = () => {
  return (
    <div className={styles.historyLayout}>
      <div className={styles.navigation}>
        <NavLink to="rides">Trajets</NavLink>
        <NavLink to="bookings">Réservations</NavLink>
      </div>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default HistoryLayout;
