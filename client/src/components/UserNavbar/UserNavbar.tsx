import useAuth from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Arrow from "@/assets/images/arrow-icon.svg?react";
import BigLogo from "@/assets/images/big-logo.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import SearchIcon from "@/assets/images/search-icon.svg?react";
import SmallLogo from "@/assets/images/small-logo.svg?react";

import styles from "./UserNavbar.module.css";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { user, clearUser } = useUser();
  const navbarRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      setIsDropdownOpen(false);
      navigate("/");
    } catch {
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDropdownOpen]);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <nav ref={navbarRef} className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.leftSection}>
          {!isMobile ? (
            <BigLogo onClick={() => navigate("/")} className={styles.bigLogo} />
          ) : (
            <SmallLogo onClick={() => navigate("/")} className={styles.smallLogo} />
          )}

          {isMobile && <SearchIcon className={styles.searchIcon} onClick={() => navigate("/search")} />}

          {!isMobile && (
            <Link to="/carpool" className={styles.navLink}>
              Covoiturages
            </Link>
          )}
        </div>

        <div className={styles.rightSection}>
          {!isMobile && (
            <Link to="/search" className={styles.navLink}>
              Rechercher
            </Link>
          )}
          <div className={styles.avatarContainer}>
            <div className={styles.avatarWrapper} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img src={user?.avatar ?? DefaultAvatar} alt="Avatar" className={styles.avatar} />
              <Arrow className={`${styles.arrow} ${isDropdownOpen ? styles.arrowUp : styles.arrowDown}`} />
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {isAuthenticated ? (
                  <>
                    <Link to="/trips" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      Mes trajets
                    </Link>
                    <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      Profil
                    </Link>
                    <Link to="/contact" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      Nous contacter
                    </Link>
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/register" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      Inscription
                    </Link>
                    <Link to="/login" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      Connexion
                    </Link>
                    <Link to="/contact" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      Nous contacter
                    </Link>
                  </>
                )}
                <div className={styles.divider}></div>
                <Link to="/carpool" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                  Covoiturages
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
