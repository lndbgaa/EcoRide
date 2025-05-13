import { axiosPrivate } from "../../api/axiosInstance";

import type { CreateVehicle, Vehicle } from "@/types/VehicleTypes";

class VehicleService {
  static async addVehicle(data: CreateVehicle): Promise<void> {
    const url = "/vehicles";
    await axiosPrivate.post(url, data, { headers: { "Content-Type": "application/json" } });
  }

  static async getVehicle(vehicleId: string): Promise<Vehicle> {
    const url = `/vehicles/${vehicleId}`;
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  // TODO: Gérer le cas ou le véhicule est lié à un trajet en cours
  static async deleteVehicle(vehicleId: string): Promise<void> {
    const url = `/vehicles/${vehicleId}`;
    await axiosPrivate.delete(url);
  }
}

export default VehicleService;
