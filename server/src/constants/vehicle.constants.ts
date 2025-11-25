import type { Includeable } from "sequelize";

export const VEHICLE_MIN_SEATS = 2;
export const VEHICLE_MAX_SEATS = 9;

export const VEHICLE_ASSOCIATIONS: Includeable[] = [
  { association: "brand" },
  { association: "color" },
  { association: "energy" },
];

export const VEHICLE_ECO_ENERGY_KEYS = ["electric", "hydrogen"];
