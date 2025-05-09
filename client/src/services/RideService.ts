import { axiosPrivate } from "api/axiosInstance";

class RideService {
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
