import { axiosPrivate } from "api/axiosInstance";

class AdminService {
  /**
   * Récupère les informations de l'administrateur connecté
   */
  static async getMyInfo() {
    const url = "/admins/me";
    const response = await axiosPrivate.get(url);
    return response.data;
  }
}

export default AdminService;
