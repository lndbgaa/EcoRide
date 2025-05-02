import {
  ACCOUNT_ROLES_ID,
  ACCOUNT_ROLES_LABEL,
  ACCOUNT_STATUSES,
  BOOKING_STATUSES,
  INCIDENT_STATUSES,
  REVIEW_STATUSES,
  RIDE_STATUSES,
  USER_ROLES,
} from "@/constants/index.js";

export type AccountRoleId =
  (typeof ACCOUNT_ROLES_ID)[keyof typeof ACCOUNT_ROLES_ID];

export type AccountRoleLabel =
  (typeof ACCOUNT_ROLES_LABEL)[keyof typeof ACCOUNT_ROLES_LABEL];

export type AccountStatus =
  (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export type RideStatus = (typeof RIDE_STATUSES)[keyof typeof RIDE_STATUSES];

export type ReviewStatus =
  (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];

export type IncidentStatus =
  (typeof INCIDENT_STATUSES)[keyof typeof INCIDENT_STATUSES];
