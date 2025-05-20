import { axiosPrivate, axiosPublic } from "../../api/axiosInstance";

import type { LoginData, RegisterData } from "@/types/AuthTypes";

class AuthService {
  /**
   * Inscription d'un compte (utilisateur)
   * @param data - Données d'inscription
   * @returns Token d'accès
   */
  static async register(data: RegisterData): Promise<{ accessToken: string }> {
    const url = "/auth/register";
    const response = await axiosPublic.post(url, data);
    const { accessToken } = response.data.data;
    return { accessToken };
  }

  /**
   * Connexion d'un compte (utilisateur, employé, administrateur)
   * @param data - Données de connexion
   * @returns Token d'accès
   */
  static async login(data: LoginData): Promise<{ accessToken: string }> {
    const url = "/auth/login";
    const response = await axiosPublic.post(url, data);
    const { accessToken } = response.data.data;
    return { accessToken };
  }

  /**
   * Déconnexion d'un compte (utilisateur, employé, administrateur)
   */
  static async logout(): Promise<void> {
    const url = "/auth/logout";
    await axiosPublic.post(url, null);
  }

  /**
   * Rafraîchissement du token d'accès (utilisateur, employé, administrateur)
   * @returns Token d'accès
   */
  static async refreshAccessToken(): Promise<{ accessToken: string }> {
    const url = "/auth/refresh-token";
    const response = await axiosPrivate.post(url, null);
    const { accessToken } = response.data.data;
    return { accessToken };
  }
}

export default AuthService;
