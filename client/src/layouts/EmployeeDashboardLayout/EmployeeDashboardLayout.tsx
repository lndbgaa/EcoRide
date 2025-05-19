import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import styles from "./EmployeeDashboardLayout.module.css";

const EmployeeDashboardLayout = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState({});

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('a[class*="active"]') as HTMLElement;
      if (activeLink) {
        setSliderStyle({
          left: activeLink.offsetLeft + "px",
          width: activeLink.offsetWidth + "px",
        });
      }
    }
  }, [location.pathname]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.navigation} ref={navRef}>
        <NavLink to="reviews">Avis </NavLink>
        <NavLink to="incidents">Incidents</NavLink>
        <div className={styles.slider} style={sliderStyle}></div>
      </div>

      <Outlet />
    </div>
  );
};

export default EmployeeDashboardLayout;
