import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProfilePage.module.css";

import DeleteIcon from "@/assets/images/cross.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.svg?react";
import RightArrow from "@/assets/images/right-arrow.svg?react";

import useUser from "@/hooks/useUser";
import PreferenceService from "@/services/PreferenceService";
import UserService from "@/services/UserService";
import { Preference } from "@/types/PreferenceTypes";
import { Vehicle } from "@/types/VehicleTypes";
const ProfilePage = () => {
  const [isDriver, setIsDriver] = useState(false);
  const [isPassenger, setIsPassenger] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);

  const { user, toggleUserRole } = useUser();
  const { credits, firstName } = user ?? {};

  const handleRoleChange = async (role: string) => {
    await toggleUserRole(role);

    if (role === "driver") {
      setIsDriver(!isDriver);
    } else if (role === "passenger") {
      setIsPassenger(!isPassenger);
    }
  };

  const handlePreferenceChange = async (id: string) => {
    await PreferenceService.togglePreferenceValue(id);

    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, value: !p.value } : p)));
  };

  const handleDeletePreference = async (id: string) => {
    await PreferenceService.deletePreference(id);

    setPreferences((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    if (user?.isDriver) {
      setIsDriver(true);
    }
    if (user?.isPassenger) {
      setIsPassenger(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchVehicles = async (): Promise<void> => {
      const vehicles = await UserService.getUserVehicles();
      setVehicles(vehicles);
    };

    if (isDriver) {
      fetchVehicles();
    }
  }, [isDriver]);

  useEffect(() => {
    const fetchPreferences = async (): Promise<void> => {
      const preferences = await UserService.getUserPreferences();
      setPreferences(preferences);
    };

    if (isDriver) {
      fetchPreferences();
    }
  }, [isDriver]);

  return (
    <div className={styles.profilePage}>
      <div className={styles.infoSection}>
        <p className={styles.credits}>
          Crédits : <span>{credits}</span>
        </p>
        <div className={styles.avatarName}>
          <DefaultAvatar className={styles.avatar} />
          <p className={styles.name}>{firstName}</p>
        </div>

        <div className={styles.profileEditLinks}>
          <Link to="/dashboard/profile/picture/edit" className={styles.profileEditLink}>
            Modifier ma photo de profil
          </Link>
          <Link to="/dashboard/profile/info/edit" className={styles.profileEditLink}>
            Modifier mes informations personnelles
          </Link>
        </div>

        <div className={styles.roleSelection}>
          <p>Je suis : </p>

          <div className={styles.roleChoices}>
            <label htmlFor="driver" className={styles.roleChoice}>
              <input
                type="checkbox"
                id="driver"
                name="driver"
                checked={isDriver}
                onChange={() => handleRoleChange("driver")}
              />
              <div className={styles.checkboxMark}></div>
              <span>Chauffeur</span>
            </label>
            <label htmlFor="passenger" className={styles.roleChoice}>
              <input
                type="checkbox"
                id="passenger"
                name="passenger"
                checked={isPassenger}
                onChange={() => handleRoleChange("passenger")}
              />
              <div className={styles.checkboxMark}></div>
              <span>Passager</span>
            </label>
          </div>
        </div>
      </div>

      {isDriver && (
        <>
          <div className={styles.vehiclesSection}>
            <p className={styles.sectionTitle}>Véhicules</p>
            <div className={styles.vehicleList}>
              {vehicles?.length > 0 &&
                vehicles.map((vehicle) => (
                  <Link
                    to={`/dashboard/profile/vehicle/${vehicle.id}/show`}
                    key={vehicle.id}
                    className={styles.vehicleItem}
                  >
                    <div>
                      <p className={styles.vehicleInfo}>
                        {vehicle.brand} <span>{vehicle.model}</span>
                      </p>

                      <p className={styles.vehicleColor}>{vehicle.color}</p>
                    </div>

                    <RightArrow />
                  </Link>
                ))}
            </div>
            <Link to="/dashboard/profile/vehicle/add" className={styles.addVehicleLink}>
              + Ajouter un véhicule
            </Link>
          </div>
          <div className={styles.preferencesSection}>
            <p className={styles.sectionTitle}>Préférences</p>
            <div className={styles.preferenceList}>
              {preferences.map((preference) => {
                return !preference.isCustom ? (
                  <label htmlFor={preference.label} key={preference.id} className={styles.defaultPreferenceItem}>
                    <input
                      type="checkbox"
                      id={preference.label}
                      name={preference.label}
                      checked={preference.value}
                      onChange={() => handlePreferenceChange(preference.id)}
                    />
                    <div className={styles.checkboxMark}></div>
                    <span>{`${preference.label} (C'est ok!)`}</span>
                  </label>
                ) : (
                  <div key={preference.id} className={styles.customPreferenceItem}>
                    <p className={styles.preferenceLabel}>{preference.label}</p>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDeletePreference(preference.id)}
                    >
                      <DeleteIcon className={styles.deleteIcon} />
                    </button>
                  </div>
                );
              })}
            </div>
            <Link to="/dashboard/profile/preference/add" className={styles.addPreferenceLink}>
              + Ajouter une préférence
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
