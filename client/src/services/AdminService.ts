import { axiosPrivate } from "api/axiosInstance";

import type { CreateEmployee } from "@/types/EmployeeTypes";

class AdminService {
  /**
   * Récupère les informations de l'administrateur connecté
   */
  static async getMyInfo() {
    const url = "/admins/me";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  static async getDailyRides() {
    const url = "/admin/stats/daily-rides";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  static async getDailyCredits() {
    const url = "/admin/stats/daily-credits";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  static async getTotalCredits() {
    const url = "/admin/stats/total-credits";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  static async getAllAccounts() {
    const url = "/admin/accounts";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  static async suspendAccount(accountId: string) {
    const url = `/admin/accounts/${accountId}/suspend`;
    const response = await axiosPrivate.patch(url);
    return response.data;
  }

  static async unsuspendAccount(accountId: string) {
    const url = `/admin/accounts/${accountId}/unsuspend`;
    const response = await axiosPrivate.patch(url);
    return response.data;
  }

  static async createEmployee(data: CreateEmployee) {
    const url = "/admin/employees";
    const response = await axiosPrivate.post(url, data);
    return response.data;
  }
}

export default AdminService;
