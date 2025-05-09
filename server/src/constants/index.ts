import type { Includeable } from "sequelize";

export const ACCOUNT_ROLES_ID = {
  ADMIN: 1,
  EMPLOYEE: 2,
  USER: 3,
} as const;

export const ACCOUNT_ROLES_LABEL = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  USER: "user",
} as const;

export const ACCOUNT_ROLES_MAP = {
  [ACCOUNT_ROLES_ID.ADMIN]: ACCOUNT_ROLES_LABEL.ADMIN,
  [ACCOUNT_ROLES_ID.EMPLOYEE]: ACCOUNT_ROLES_LABEL.EMPLOYEE,
  [ACCOUNT_ROLES_ID.USER]: ACCOUNT_ROLES_LABEL.USER,
} as const;

export const ACCOUNT_ROLES_MAP_REVERSE = {
  [ACCOUNT_ROLES_LABEL.ADMIN]: ACCOUNT_ROLES_ID.ADMIN,
  [ACCOUNT_ROLES_LABEL.EMPLOYEE]: ACCOUNT_ROLES_ID.EMPLOYEE,
  [ACCOUNT_ROLES_LABEL.USER]: ACCOUNT_ROLES_ID.USER,
} as const;

export const ACCOUNT_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export const USER_ROLES = {
  DRIVER: "driver",
  PASSENGER: "passenger",
} as const;

export const VEHICLE_ECO_ENERGY_IDS: number[] = [3, 9]; // électrique, hydrogène

export const VEHICLE_ASSOCIATIONS: Includeable[] = [
  { association: "brand" },
  { association: "color" },
  { association: "energy" },
];

export const DEFAULT_PREFERENCES = [
  { label: "Fumeurs", value: false, is_custom: false },
  { label: "Animaux", value: false, is_custom: false },
] as const;

export const BOOKING_STATUSES = {
  CONFIRMED: "confirmed",
  AWAITING_FEEDBACK: "awaiting_feedback",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const REVIEW_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const RIDE_STATUSES = {
  OPEN: "open",
  FULL: "full",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const INCIDENT_STATUSES = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  RESOLVED: "resolved",
} as const;

export const PLATFORM_CREDITS_PER_SEAT = 2;
