import { axiosPrivate } from "../../api/axiosInstance";

import type { IncidentResolution } from "@/types/IncidentTypes";

class IncidentService {
  static async getPendingIncidents() {
    const url = "/incidents/pending";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  static async getIncidentDetails(id: string) {
    const url = `/incidents/${id}`;
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  static async assignIncident(id: string) {
    const url = `/incidents/${id}/assign`;
    const response = await axiosPrivate.patch(url);
    return response.data;
  }

  static async closeIncident(id: string, data: IncidentResolution) {
    const url = `/incidents/${id}/resolve`;
    const response = await axiosPrivate.patch(
      url,
      { note: data.resolutionNote },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
}

export default IncidentService;
