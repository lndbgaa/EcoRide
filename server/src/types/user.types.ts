import type { USER_ROLES_ID, USER_ROLES_KEY, USER_STATUSES } from "@/constants";
import type { DateTimeDTO } from "@/types";

// ===========================
//    Constants-based Types
// =========================== */

export type UserRoleId = (typeof USER_ROLES_ID)[keyof typeof USER_ROLES_ID];
export type UserRoleKey = (typeof USER_ROLES_KEY)[keyof typeof USER_ROLES_ID];
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

// ===========================
//           DTOs
// =========================== */

export interface UserRolePublicDTO {
  id: UserRoleId;
  key: UserRoleKey;
  display: string;
}

export interface UserPublicDTO {
  id: string;
  username: string;
  firstName: string | null;
  age: number | null;
  avatar: string | null;
  averageRating: number | null;
  memberSince: string | null;
  emailIsVerified: boolean;
}

export interface UserPrivateDTO extends UserPublicDTO {
  email: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  credits: number;
  birthDate: string | null;
  lastLogin: DateTimeDTO;
}

export interface UserAdminDTO extends UserPrivateDTO {
  role: UserRolePublicDTO | null;
  status: UserStatus;
  suspendedAt: DateTimeDTO;
  pendingDeletionAt: DateTimeDTO;
  deletedAt: DateTimeDTO;
}

// ===========================
//       Request Payloads
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

export interface CancelUserDeletionPayload {
  email: string;
  password: string;
}
