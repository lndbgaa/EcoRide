import type { UserPublicDTO } from "@/types";

// ===========================
//           DTOs
// =========================== */

export interface VehicleEnergyPublicDTO {
  id: number;
  key: string;
  display: string;
}

export interface VehicleColorPublicDTO {
  id: number;
  key: string;
  display: string;
}

export interface VehicleBrandPublicDTO {
  id: number;
  key: string;
  display: string;
}

export interface VehiclePublicDTO {
  id: string;
  brand: VehicleBrandPublicDTO | null;
  model: string;
  color: VehicleColorPublicDTO | null;
  energy: VehicleEnergyPublicDTO | null;
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

// ===========================
//     Request Payloads
// =========================== */

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

// ===========================
//        DB Attributes
// =========================== */

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
