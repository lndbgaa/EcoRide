import { axiosPrivate } from "api/axiosInstance";

import type { CreateRideData, SearchRide } from "@/types/RideTypes";

class RideService {
  static async searchRides(data: SearchRide) {
    const response = await axiosPrivate.post(`/rides/search`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async createRide(data: CreateRideData) {
    const response = await axiosPrivate.post(`/rides`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  static async getRideDetails(rideId: string) {
    const response = await axiosPrivate.get(`/rides/${rideId}`);
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
