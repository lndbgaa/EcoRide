import type { UserPublicDTO } from "@/types";

export interface VehiclePublicDTO {
  id: string;
  brand: string | null;
  model: string;
  color: string | null;
  energy: string | null;
  seats: number;
  isEco: boolean;
}

export interface VehiclePrivateDTO extends VehiclePublicDTO {
  licensePlate: string;
  firstRegistrationDate: string | null;
}

export interface VehicleAdminDTO extends VehiclePrivateDTO {
  owner: UserPublicDTO | null;
}

export type CreateVehiclePayload = {
  brandId: number;
  model: string;
  colorId: number;
  energyId: number;
  seats: number;
  licensePlate: string;
  firstRegistrationDate: string;
};

export type UpdateVehiclePayload = {
  brandId?: number;
  model?: string;
  colorId?: number;
  energyId?: number;
  firstRegistrationDate?: string;
};

export type VehicleCreationAttributes = {
  brand_id: number;
  model: string;
  color_id: number;
  energy_id: number;
  seats: number;
  license_plate: string;
  owner_id: string;
  first_registration_date: Date;
};
