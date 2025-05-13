import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import RightArrow from "@/assets/images/arrow-icon.svg?react";
import DeleteIcon from "@/assets/images/cross.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";

import Loader from "@/components/Loader/Loader";
import useUser from "@/hooks/useUser";
import PreferenceService from "@/services/PreferenceService";
import UserService from "@/services/UserService";
import { Preference } from "@/types/PreferenceTypes";
import { Vehicle } from "@/types/VehicleTypes";

import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [isPassenger, setIsPassenger] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [isDriverDataLoading, setIsDriverDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, toggleUserRole, isLoading: isUserLoading } = useUser();
  const { credits, firstName, memberSince, avatar, id: userId } = user ?? {};

  const navigate = useNavigate();

  const handleRoleChange = async (role: string): Promise<void> => {
    await toggleUserRole(role);

    if (role === "driver") {
      setIsDriver(!isDriver);
    } else if (role === "passenger") {
      setIsPassenger(!isPassenger);
    }
  };

  const handlePreferenceChange = async (id: string): Promise<void> => {
    await PreferenceService.togglePreferenceValue(id);
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, value: !p.value } : p)));
  };

  const handleDeletePreference = async (id: string): Promise<void> => {
    await PreferenceService.deletePreference(id);
    setPreferences((prev) => prev.filter((p) => p.id !== id));
    toast.success("Préférence supprimée avec succès");
  };

  useEffect(() => {
    if (user) {
      setIsDriver(user.isDriver);
      setIsPassenger(user.isPassenger);
    }
  }, [user]);

  useEffect(() => {
    if (!isDriver) return;

    setIsDriverDataLoading(true);

    const fetchDriverData = async (): Promise<void> => {
      try {
        const [vehicles, preferences] = await Promise.all([
          UserService.getMyVehicles(),
          UserService.getMyPreferences(),
        ]);

        setVehicles(vehicles);
        setPreferences(preferences);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsDriverDataLoading(false);
      }
    };

    fetchDriverData();
  }, [isDriver]);

  if (isUserLoading || isDriverDataLoading) {
    return <Loader />;
  }

  if (error) {
    navigate("/error");
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.infoSection}>
        <p className={styles.credits}>
          Crédits : <span>{credits}</span>
        </p>
        <Link to={`/user/${userId}/show`} className={styles.profileSummary}>
          <div className={styles.content}>
            {avatar ? (
              <img src={avatar} alt="avatar" className={styles.avatarImage} />
            ) : (
              <img src={DefaultAvatar} alt="avatar" className={styles.avatarImage} />
            )}

            <div className={styles.textContent}>
              <p className={styles.userName}>{firstName}</p>
              <p className={styles.memberSince}>
                Membre depuis le <span>{dayjs(memberSince).format("DD/MM/YYYY")}</span>
              </p>
            </div>
          </div>

          <RightArrow />
        </Link>

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
              {vehicles?.length > 0 ? (
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
                ))
              ) : (
                <p className={styles.noVehicles}>Aucun véhicule ajouté.</p>
              )}
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
