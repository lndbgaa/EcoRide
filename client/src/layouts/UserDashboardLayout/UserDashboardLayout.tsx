import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import NextEvent from "@/components/NextEvent/NextEvent";
import useUser from "@/hooks/useUser";

import styles from "./UserDashboardLayout.module.css";

const UserDashboardLayout = () => {
  const { user } = useUser();
  const { isDriver } = user ?? {};
  const [sliderStyle, setSliderStyle] = useState({});

  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

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
  }, [location.pathname]); // à chaque fois que l'url change, on met à jour le style du slider

  return (
    <div className={styles.dashboardHeader}>
      {isDriver && (
        <Link to="/ride/publish" className={styles.publishButton}>
          + Publier un trajet
        </Link>
      )}

      <NextEvent />

      <div className={styles.navigation} ref={navRef}>
        <NavLink to="profile">Profil</NavLink>
        <NavLink to="history">Historique</NavLink>
        <NavLink to="ratings">Avis</NavLink>
        <div className={styles.slider} style={sliderStyle}></div>
      </div>

      <Outlet />
    </div>
  );
};

export default UserDashboardLayout;
