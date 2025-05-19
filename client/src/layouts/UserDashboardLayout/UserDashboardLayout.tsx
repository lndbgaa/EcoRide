import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import Trip from "@/components/TripCard/TripCard";
import useUser from "@/hooks/useAccount";
import UserService from "@/services/UserService";

import styles from "./UserDashboardLayout.module.css";

import type { Booking } from "@/types/BookingTypes";
import type { Ride } from "@/types/RideTypes";

const UserDashboardLayout = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { isDriver } = user ?? {};

  const [sliderStyle, setSliderStyle] = useState({});
  const [nextEvent, setNextEvent] = useState<Ride | Booking | null>(null);
  const [eventType, setEventType] = useState<"ride" | "booking" | null>(null);

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

  useEffect(() => {
    const fetchNextEvent = async () => {
      const response = await UserService.getMyNextEvent();

      if (response) {
        setEventType(response.type);
        setNextEvent(response.data);
      } else {
        setNextEvent(null);
        setEventType(null);
      }
    };

    fetchNextEvent();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      {isDriver && (
        <Link to="/ride/publish" className={styles.publishButton}>
          + Publier un trajet
        </Link>
      )}

      {nextEvent && eventType && (
        <div className={styles.nextEvent}>
          <p className={styles.nextEventText}>Votre prochain voyage</p>
          <Trip data={nextEvent} eventType={eventType} />
        </div>
      )}

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
