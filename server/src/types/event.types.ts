import type { Booking, Trip } from "@/models";

export type EventType = "booking" | "trip";

export type UpcomingEvent = { type: "booking"; data: Booking } | { type: "trip"; data: Trip };
