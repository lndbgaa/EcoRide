export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET as string,
  EXPIRES_IN: "7d",
} as const;

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
