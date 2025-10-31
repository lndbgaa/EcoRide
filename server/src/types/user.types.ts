import type { USER_ROLES_DISPLAY, USER_ROLES_ID, USER_ROLES_KEY, USER_STATUSES } from "@/constants";
import type { DateTimeDTO } from "@/types";

// ===========================
//    Constants-based Types
// =========================== */

export type UserRoleId = (typeof USER_ROLES_ID)[keyof typeof USER_ROLES_ID];
export type UserRoleKey = (typeof USER_ROLES_KEY)[keyof typeof USER_ROLES_ID];
export type UserRoleDisplay = (typeof USER_ROLES_DISPLAY)[keyof typeof USER_ROLES_ID];
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

// ===========================
//           DTOs
// =========================== */

export interface UserPublicDTO {
  id: string;
  username: string;
  firstName: string;
  age: number | null;
  avatar: string | null;
  averageRating: number | null;
  memberSince: string | null;
  isVerified: boolean;
}

export interface UserPrivateDTO extends UserPublicDTO {
  email: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  credits: number;
  birthDate: string | null;
  lastLogin: DateTimeDTO;
}

export interface UserAdminDTO extends UserPrivateDTO {
  role: UserRoleDisplay | null;
  status: UserStatus;
  suspendedAt: DateTimeDTO;
  pendingDeletionAt: DateTimeDTO;
  deletedAt: DateTimeDTO;
}

// ===========================
//     Payloads & Results
// =========================== */

export interface UpdateUserInfoPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  birthDate?: string;
  phone?: string;
}

export interface UpdateUserPasswordPayload {
  currentPassword: string;
  newPassword: string;
}
