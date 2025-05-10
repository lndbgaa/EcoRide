export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  color: string;
  energy: string;
  seats: number;
  licensePlate: string;
  firstRegistration: string;
}

export interface CreateVehicleData {
  brandId: number;
  model: string;
  colorId: number;
  energyId: number;
  seats: number;
  licensePlate: string;
  firstRegistration: string;
}
