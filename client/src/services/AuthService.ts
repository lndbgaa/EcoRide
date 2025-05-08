import { axiosPrivate, axiosPublic } from "../../api/axiosInstance";

interface RegisterData {
  email: string;
  pseudo: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Inscription d'un utilisateur
   * @param data - Données d'inscription
   * @returns Token d'accès
   */
  static async register(data: RegisterData): Promise<{ accessToken: string }> {
    const url = "/auth/register";

    const response = await axiosPublic.post(url, data, { headers: { "Content-Type": "application/json" } });
    const { accessToken } = response.data.data;
    return { accessToken };
  }

  /**
   * Connexion d'un utilisateur
   * @param data - Données de connexion
   * @returns Token d'accès
   */
  static async login(data: LoginData): Promise<{ accessToken: string }> {
    const url = "/auth/login";

    const response = await axiosPublic.post(url, data, { headers: { "Content-Type": "application/json" } });
    const { accessToken } = response.data.data;
    return { accessToken };
  }

  /**
   * Déconnexion d'un utilisateur
   */
  static async logout(): Promise<void> {
    try {
      const url = "/auth/logout";
      await axiosPublic.post(url, null, { withCredentials: true });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  }

  /**
   * Rafraîchissement du token
   * @returns Token d'accès
   */
  static async refreshAccessToken(): Promise<{ accessToken: string }> {
    try {
      const url = "/auth/refresh-token";

      const response = await axiosPrivate.post(url, null);

      const { accessToken } = response.data.data;

      return { accessToken };
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      throw error;
    }
  }
}

export default AuthService;
