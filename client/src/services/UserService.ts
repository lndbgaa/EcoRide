import { axiosPrivate } from "../../api/axiosInstance";

import type { UpdateUserInfo, User } from "@/types/UserTypes";
import type { Vehicle } from "@/types/VehicleTypes";

class UserService {
  /**
   * Récupère les informations de l'utilisateur connecté
   */
  static async getUserInfo(): Promise<User> {
    const url = "/users/me";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Modifie les informations de l'utilisateur connecté
   */
  static async updateUserInfo(data: UpdateUserInfo) {
    const url = "/users/me";
    await axiosPrivate.patch(url, data, { headers: { "Content-Type": "application/json" } });
  }

  /**
   * Modifie l'avatar de l'utilisateur connecté
   */
  static async updateAvatar(file: File): Promise<{ url: string }> {
    const url = "/users/me/avatar";
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosPrivate.patch(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
    const { data } = response.data;
    return data;
  }

  /**
   * Modifie le rôle de l'utilisateur connecté
   */
  static async toggleUserRole(role: string) {
    const url = "/users/me/role";
    await axiosPrivate.patch(url, { role }, { headers: { "Content-Type": "application/json" } });
  }

  /**
   * Récupère les véhicules de l'utilisateur connecté
   */
  static async getUserVehicles(): Promise<Vehicle[]> {
    const url = "/users/me/vehicles";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère les préférences de l'utilisateur connecté
   */
  static async getUserPreferences() {
    const url = "/users/me/preferences";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère le prochain événement de l'utilisateur connecté (réservation, trajet)
   */
  static async getUserNextEvent() {
    try {
      const url = "/users/me/events/next";
      const response = await axiosPrivate.get(url);

      return response.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default UserService;
