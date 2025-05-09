import { axiosPrivate } from "api/axiosInstance";

class PreferenceService {
  static async togglePreferenceValue(id: string) {
    const url = `/users/me/preferences/${id}`;
    const response = await axiosPrivate.patch(url, null);
    return response.data;
  }

  static async deletePreference(id: string) {
    const url = `/users/me/preferences/${id}`;
    const response = await axiosPrivate.delete(url);
    return response.data;
  }
}

export default PreferenceService;
