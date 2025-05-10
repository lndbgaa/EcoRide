import { axiosPrivate } from "api/axiosInstance";

interface Option {
  id: number;
  label: string;
}

class CatalogService {
  public static async getVehicleBrands(): Promise<Option[]> {
    const url = "/catalog/vehicle-brands";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  public static async getVehicleColors(): Promise<Option[]> {
    const url = "/catalog/vehicle-colors";
    const response = await axiosPrivate.get(url);
    return response.data;
  }

  public static async getVehicleEnergies(): Promise<Option[]> {
    const url = "/catalog/vehicle-energies";
    const response = await axiosPrivate.get(url);
    return response.data;
  }
}

export default CatalogService;
