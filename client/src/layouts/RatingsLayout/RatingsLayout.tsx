import { NavLink, Outlet } from "react-router-dom";

import styles from "./RatingsLayout.module.css";

const RatingsLayout = () => {
  return (
    <div className={styles.ratingsLayout}>
      <div className={styles.navigation}>
        <NavLink to="received">Reçus</NavLink>
        <NavLink to="given">Laissés</NavLink>
      </div>

      <Outlet />
    </div>
  );
};

export default RatingsLayout;
