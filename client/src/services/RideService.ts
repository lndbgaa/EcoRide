import { axiosPrivate } from "api/axiosInstance";

import type { SearchRideRequestData } from "@/types/RideTypes";

class RideService {
  static async searchRide(data: SearchRideRequestData) {
    const response = await axiosPrivate.post(`/rides/search`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async cancelRide(rideId: string) {
    const response = await axiosPrivate.patch(`/rides/${rideId}/cancel`);
    return response.data;
  }

  static async startRide(rideId: string) {
    const response = await axiosPrivate.patch(`/rides/${rideId}/start`);
    return response.data;
  }

  static async endRide(rideId: string) {
    const response = await axiosPrivate.patch(`/rides/${rideId}/end`);
    return response.data;
  }
}

export default RideService;
