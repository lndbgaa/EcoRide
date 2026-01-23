export const INCIDENT_STATUSES = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  RESOLVED: "resolved",
} as const;

export const INCIDENT_SORT_FIELDS = ["createdAt", "assignedAt", "resolvedAt"] as const;