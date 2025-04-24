export type CreateVehicleData = {
  brand_id: number;
  model: string;
  color_id: number;
  energy_id: number;
  seats: number;
  license_plate: string;
  first_registration_date: Date;
};

export type UpdateVehicleData = {
  brand_id?: number;
  model?: string;
  color_id?: number;
  energy_id?: number;
  seats?: number;
};

export type VehicleData = {
  id: string;
  brand_id: number;
  model: string;
  color_id: number;
  energy_id: number;
  seats: number;
  license_plate?: string;
  first_registration_date?: Date;
  owner_id?: string;
  created_at?: Date;
  updated_at?: Date;
};
