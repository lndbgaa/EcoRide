import { NavLink, Outlet } from "react-router-dom";

import styles from "./EmployeeIncidentsLayout.module.css";

const EmployeeIncidentsLayouts = () => {
  return (
    <div className={styles.incidentsLayout}>
      <div className={styles.navigation}>
        <NavLink to="new">Nouveau</NavLink>
        <NavLink to="assigned">Assignés</NavLink>
        <NavLink to="resolved">Résolus</NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default EmployeeIncidentsLayouts;
