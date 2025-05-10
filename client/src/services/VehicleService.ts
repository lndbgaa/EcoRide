import { CreateVehicleData } from "@/types/VehicleTypes";
import { axiosPrivate } from "../../api/axiosInstance";

class VehicleService {
  static async addVehicle(data: CreateVehicleData) {
    const url = "/users/me/vehicles";
    const response = await axiosPrivate.post(url, data, { headers: { "Content-Type": "application/json" } });
    return response.data;
  }
}

export default VehicleService;
