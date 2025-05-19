import { axiosPrivate } from "../../api/axiosInstance";

class EmployeeService {
  /**
   * Récupère les informations de l'employé connecté
   */
  static async getMyInfo() {
    const url = "/employees/me";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  /**
   * Récupère les incidents assignés à l'employé connecté
   */
  static async getAssignedIncidents() {
    const url = "/employees/me/incidents/assigned";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  /**
   * Récupère les incidents résolus par l'employé connecté
   */
  static async getResolvedIncidents() {
    const url = "/employees/me/incidents/resolved";
    const response = await axiosPrivate.get(url);
    return response.data;
  }
}

export default EmployeeService;
