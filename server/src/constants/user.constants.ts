export const USER_ROLES_ID = {
  ADMIN: 1,
  MODERATOR: 2,
  USER: 3,
} as const;

export const USER_ROLES_KEY = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
} as const;

export const USER_ROLES_DISPLAY = {
  ADMIN: "Administrateur",
  MODERATOR: "Modérateur",
  USER: "Utilisateur",
} as const;

export const USER_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING_DELETION: "pending_deletion",
  DELETED: "deleted",
} as const;
