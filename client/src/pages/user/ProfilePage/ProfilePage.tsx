import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import RightArrow from "@/assets/images/arrow-icon.svg?react";
import DeleteIcon from "@/assets/images/cross-icon.svg?react";
import DefaultAvatar from "@/assets/images/default-avatar.jpg";

import Loader from "@/components/Loader/Loader";
import useUser from "@/hooks/useUser";
import PreferenceService from "@/services/PreferenceService";
import UserService from "@/services/UserService";

import styles from "./ProfilePage.module.css";

import type { Preference } from "@/types/PreferenceTypes";
import type { Vehicle } from "@/types/VehicleTypes";

const ProfilePage = () => {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isDriverDataLoading, setIsDriverDataLoading] = useState(true);

  const [isDriver, setIsDriver] = useState(false);
  const [isPassenger, setIsPassenger] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);

  const { user, toggleUserRole, isLoading: isUserLoading } = useUser();
  const { credits, firstName, memberSince, avatar, id: userId } = user ?? {};

  const handleRoleChange = async (role: string) => {
    await toggleUserRole(role);
    if (role === "driver") setIsDriver(!isDriver);
    else if (role === "passenger") setIsPassenger(!isPassenger);
  };

  const handlePreferenceChange = async (id: string) => {
    await PreferenceService.togglePreferenceValue(id);
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, value: !p.value } : p)));
  };

  const handleDeletePreference = async (id: string) => {
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

    const fetchDriverData = async () => {
      setIsDriverDataLoading(true);
      try {
        const vehicles = await UserService.getMyVehicles();
        setVehicles(vehicles);
      } catch {
        setError((prev) => ({
          ...prev,
          vehicles: "Oups ! Une erreur est survenue lors de la récupération de vos véhicules.",
        }));
      }

      try {
        const preferences = await UserService.getMyPreferences();
        setPreferences(preferences);
      } catch {
        setError((prev) => ({
          ...prev,
          preferences: "Oups ! Une erreur est survenue lors de la récupération de vos préférences.",
        }));
      } finally {
        setIsDriverDataLoading(false);
      }
    };

    fetchDriverData();
  }, [isDriver]);

  if (isUserLoading || isDriverDataLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.infoSection}>
        <p className={styles.credits}>
          Crédits : <span>{credits}</span>
        </p>

        <Link to={`/user/${userId}/show`} className={styles.profileSummary}>
          <div className={styles.content}>
            <img src={avatar ?? DefaultAvatar} alt="avatar" className={styles.avatarImage} />
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
              <input type="checkbox" id="driver" checked={isDriver} onChange={() => handleRoleChange("driver")} />
              <div className={styles.checkboxMark}></div>
              <span>Chauffeur</span>
            </label>
            <label htmlFor="passenger" className={styles.roleChoice}>
              <input
                type="checkbox"
                id="passenger"
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
            {error.vehicles ? (
              <p className={styles.errorPreferences}>{error.vehicles}</p>
            ) : (
              <div className={styles.vehicleList}>
                {vehicles.length > 0 ? (
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
            )}
            <Link to="/dashboard/profile/vehicle/add" className={styles.addVehicleLink}>
              + Ajouter un véhicule
            </Link>
          </div>

          <div className={styles.preferencesSection}>
            <p className={styles.sectionTitle}>Préférences</p>
            {error.preferences ? (
              <p className={styles.errorVehicles}>{error.preferences}</p>
            ) : (
              <div className={styles.preferenceList}>
                {preferences.map((preference) =>
                  !preference.isCustom ? (
                    <label htmlFor={preference.label} key={preference.id} className={styles.defaultPreferenceItem}>
                      <input
                        type="checkbox"
                        id={preference.label}
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
                  )
                )}
              </div>
            )}
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
