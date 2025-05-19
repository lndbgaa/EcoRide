import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ArrowIcon from "@/assets/images/arrow-icon.svg?react";
import BigLogo from "@/assets/images/big-logo.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import SearchIcon from "@/assets/images/search-icon.svg?react";
import SmallLogo from "@/assets/images/small-logo.svg?react";

import useAccount from "@/hooks/useAccount";
import useAuth from "@/hooks/useAuth";

import styles from "./UserNavbar.module.css";

import type { User } from "@/types/UserTypes";

const UserNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const { account, clearAccount } = useAccount();

  const user = account as User;

  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => setIsDropdownOpen(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const goHome = () => navigate("/");

  const handleLogout = async () => {
    try {
      await logout();
      clearAccount();
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

  const AuthenticatedLinks = () => (
    <>
      <Link to="/trips" className={styles.dropdownItem} onClick={closeDropdown}>
        Trajets
      </Link>
      <Link to="/dashboard" className={styles.dropdownItem} onClick={closeDropdown}>
        Profil
      </Link>
      <Link to="/contact" className={styles.dropdownItem} onClick={closeDropdown}>
        Nous contacter
      </Link>
      <button onClick={handleLogout} className={styles.dropdownItem}>
        Déconnexion
      </button>
    </>
  );

  const UnauthenticatedLinks = () => (
    <>
      <Link to="/register" className={styles.dropdownItem} onClick={closeDropdown}>
        Inscription
      </Link>
      <Link to="/login" className={styles.dropdownItem} onClick={closeDropdown}>
        Connexion
      </Link>
    </>
  );

  return (
    <nav ref={navbarRef} className={styles.mainContainer}>
      <div className={styles.navbarContainer}>
        <div className={styles.leftSection}>
          {!isMobile ? (
            <BigLogo onClick={goHome} className={styles.bigLogo} />
          ) : (
            <SmallLogo onClick={goHome} className={styles.smallLogo} />
          )}

          {isMobile && (
            <SearchIcon className={styles.searchIcon} onClick={() => navigate("/search")} aria-label="Rechercher" />
          )}

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
            <div
              className={styles.avatarWrapper}
              onClick={toggleDropdown}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggleDropdown()}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <img src={user?.avatar ?? DefaultAvatar} alt="Avatar" className={styles.avatar} />
              <ArrowIcon className={classNames(styles.arrowIcon, isDropdownOpen ? styles.up : styles.down)} />
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {isAuthenticated ? <AuthenticatedLinks /> : <UnauthenticatedLinks />}
                <div className={styles.divider}></div>
                <Link to="/carpool" className={styles.dropdownItem} onClick={closeDropdown}>
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
