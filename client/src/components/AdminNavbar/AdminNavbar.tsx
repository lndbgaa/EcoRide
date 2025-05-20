import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ArrowIcon from "@/assets/images/arrow-icon.svg?react";
import BigLogo from "@/assets/images/big-logo.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import SmallLogo from "@/assets/images/small-logo.svg?react";

import useAccount from "@/hooks/useAccount";
import useAuth from "@/hooks/useAuth";

import styles from "./AdminNavbar.module.css";

const AdminNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { clearAccount } = useAccount();
  const navbarRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const goDashboard = () => navigate("/admin/dashboard");

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

  return (
    <nav ref={navbarRef} className={styles.mainContainer}>
      <div className={styles.navbarContainer}>
        <div className={styles.leftSection}>
          {!isMobile ? (
            <BigLogo onClick={goDashboard} className={styles.bigLogo} />
          ) : (
            <SmallLogo onClick={goDashboard} className={styles.smallLogo} />
          )}
        </div>

        <div className={styles.rightSection}>
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
              <img src={DefaultAvatar} alt="Avatar" className={styles.avatar} />
              <ArrowIcon className={classNames(styles.arrowIcon, isDropdownOpen ? styles.up : styles.down)} />
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
