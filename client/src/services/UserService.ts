import { User } from "@/types/UserTypes";
import { axiosPrivate } from "../../api/axiosInstance";

class UserService {
  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  static async getUserInfo(): Promise<User> {
    const url = "/users/me";
    const response = await axiosPrivate.get(url, { headers: { "Content-Type": "application/json" } });
    const { data } = response.data;
    return data;
  }

  /**
   * Modifier le rôle de l'utilisateur connecté
   */
  static async toggleUserRole(role: string) {
    const url = "/users/me/role";
    await axiosPrivate.patch(url, { role }, { headers: { "Content-Type": "application/json" } });
  }

  /**
   * Récupérer les véhicules de l'utilisateur connecté
   */
  static async getUserVehicles() {
    const url = "/users/me/vehicles";
    const response = await axiosPrivate.get(url, { headers: { "Content-Type": "application/json" } });
    const { data } = response.data;
    return data;
  }

  /**
   * Récupérer les préférences de l'utilisateur connecté
   */
  static async getUserPreferences() {
    const url = "/users/me/preferences";
    const response = await axiosPrivate.get(url, { headers: { "Content-Type": "application/json" } });
    const { data } = response.data;
    return data;
  }

  /**
   * Récupérer le prochain événement de l'utilisateur connecté (réservation, trajet)
   */
  static async getUserNextEvent() {
    try {
      const url = "/users/me/events/next";
      const response = await axiosPrivate.get(url, { headers: { "Content-Type": "application/json" } });

      return response.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default UserService;
