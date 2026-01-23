import { USER_FILTERABLE_STATUSES, USER_ROLES_ID, USER_ROLES_KEY, USER_SORT_FIELDS, USER_STATUSES } from "@/constants";

import type { User } from "@/models";
import type { DateTimeDTO } from "@/types";

/* ===========================
    Constants-based Types
   =========================== */

export type UserRoleId = (typeof USER_ROLES_ID)[keyof typeof USER_ROLES_ID];
export type UserRoleKey = (typeof USER_ROLES_KEY)[keyof typeof USER_ROLES_KEY];
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export type UserFilterableStatus = (typeof USER_FILTERABLE_STATUSES)[number];
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

/* ===========================
           DTOs
   =========================== */

export interface UserRoleDTO {
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
  emailIsVerified: boolean;
  isDeleted: boolean;
  createdAt: DateTimeDTO;
}

export interface UserPrivateDTO extends UserPublicDTO {
  email: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  credits: number;
  birthDate: string | null;
  lastLogin: DateTimeDTO | null;
}

export interface UserAdminDTO extends UserPrivateDTO {
  role: UserRoleDTO | null;
  status: UserStatus;
  suspendedAt: DateTimeDTO | null;
  pendingDeletionAt: DateTimeDTO | null;
  deletedAt: DateTimeDTO | null;
}

/* ===========================
       Request Types
   =========================== */

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

export interface UpdateUserRolePayload {
  role: Exclude<UserRoleKey, "admin">;
}

export interface GetUsersQuery {
  role?: UserRoleKey;
  status?: UserFilterableStatus;
  search?: string;
  sortBy?: "createdAt" | "username";
  sortDir?: "asc" | "desc";
}

/* ===========================
       Service Types
   =========================== */

export interface GetUsersSortOptions {
  by?: UserSortField;
  dir?: "asc" | "desc";
}

export interface GetUsersFilters {
  status?: UserFilterableStatus;
  role?: UserRoleKey;
  search?: string;
}

/* ===========================
        Response Types
   =========================== */

export interface GetUsersResponse {
  count: number;
  users: User[];
}
