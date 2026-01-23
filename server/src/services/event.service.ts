import { Op, QueryTypes } from "sequelize";

import { dayjs, sequelize } from "@/config";
import { BOOKING_STATUSES, TRIP_STATUSES } from "@/constants";
import { Booking, Trip, User } from "@/models";

import type { UpcomingEvent } from "@/types";

export class EventService {
  /**
   * Retrieves the next upcoming event (trip or booking) for a specific user.
   * Compares the user's next confirmed booking as passenger and next trip as driver,
   * returning the one with the earliest departure date.
   *
   * @param {User} user - The user for whom to find the next upcoming event.
   * @returns {Promise<Booking | Trip | null>} The next upcoming booking or trip, or null if no upcoming events exist.
   */
  public static async getNextEventforUser(user: User): Promise<Booking | Trip | null> {
    const now = dayjs().toDate();

    const nextBooking = await Booking.findOne({
      where: {
        passenger_id: user.id,
        status: BOOKING_STATUSES.CONFIRMED,
      },
      include: [
        {
          association: "trip",
          required: true,
          where: {
            status: { [Op.in]: [TRIP_STATUSES.OPEN, TRIP_STATUSES.FULL] },
            departure_datetime: { [Op.gte]: now },
          },
        },
      ],
      order: [[{ model: Trip, as: "trip" }, "departure_datetime", "ASC"]],
    });

    const nextTrip = await Trip.findOne({
      where: {
        driver_id: user.id,
        status: { [Op.in]: [TRIP_STATUSES.OPEN, TRIP_STATUSES.FULL] },
        departure_datetime: { [Op.gte]: now },
      },
      order: [["departure_datetime", "ASC"]],
    });

    const bookingDate = nextBooking?.trip?.departure_datetime;
    const tripDate = nextTrip?.departure_datetime;

    if (bookingDate && tripDate) {
      return bookingDate < tripDate ? nextBooking : nextTrip;
    }

    return nextBooking || nextTrip || null;
  }

  /**
   * Retrieves paginated upcoming events (trips and bookings) for a specific user.
   * Includes trips where the user is the driver and confirmed bookings where the user is a passenger.
   * Events are sorted by priority (in-progress events first) then by departure date ascending.
   *
   * @param {number} limit - Maximum number of events to return.
   * @param {number} offset - Number of events to skip (for pagination).
   * @param {User} user - The user for whom to retrieve upcoming events.
   * @returns {Promise<{ count: number; events: UpcomingEvent[] }>} Object containing total count and list of upcoming events.
   */
  public static async getUpcomingEventsforUser(
    limit: number,
    offset: number,
    user: User
  ): Promise<{ count: number; events: UpcomingEvent[] }> {
    const startOfToday = dayjs().startOf("day").toDate();

    const idsQuery = `
      SELECT * FROM (
        SELECT
          'booking' as event_type,
          b.id,
          t.departure_datetime,
          CASE WHEN t.status = :inProgressStatus THEN 0 ELSE 1 END as priority
        FROM bookings b
        INNER JOIN trips t ON b.trip_id = t.id
        WHERE b.passenger_id = :userId
          AND b.status = :confirmedStatus
          AND (
            t.status = :inProgressStatus
            OR (
              t.status IN (:openStatus, :fullStatus)
              AND t.departure_datetime >= :startOfToday
            )
          )
  
        UNION ALL
  
        SELECT 
          'trip' as event_type,
          t.id,
          t.departure_datetime,
          CASE WHEN t.status = :inProgressStatus THEN 0 ELSE 1 END as priority
        FROM trips t
        WHERE t.driver_id = :userId
          AND (
            t.status = :inProgressStatus
            OR (
              t.status IN (:openStatus, :fullStatus)
              AND t.departure_datetime >= :startOfToday
            )
          )
      ) as combined_events
      ORDER BY priority ASC, departure_datetime ASC
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 1 FROM bookings b
        INNER JOIN trips t ON b.trip_id = t.id
        WHERE b.passenger_id = :userId
          AND b.status = :confirmedStatus
          AND (
            t.status = :inProgressStatus
            OR (
              t.status IN (:openStatus, :fullStatus)
              AND t.departure_datetime >= :startOfToday
            )
          )
  
        UNION ALL
  
        SELECT 1 FROM trips t
        WHERE t.driver_id = :userId
          AND (
            t.status = :inProgressStatus
            OR (
              t.status IN (:openStatus, :fullStatus)
              AND t.departure_datetime >= :startOfToday
            )
          )
      ) as count_subquery
    `;

    const replacements = {
      userId: user.id,
      confirmedStatus: BOOKING_STATUSES.CONFIRMED,
      inProgressStatus: TRIP_STATUSES.IN_PROGRESS,
      openStatus: TRIP_STATUSES.OPEN,
      fullStatus: TRIP_STATUSES.FULL,
      startOfToday,
      limit,
      offset,
    };

    try {
      const [idsResult, countResult] = await Promise.all([
        sequelize.query(idsQuery, {
          replacements,
          type: QueryTypes.SELECT,
        }),
        sequelize.query(countQuery, {
          replacements: { ...replacements, limit: undefined, offset: undefined },
          type: QueryTypes.SELECT,
        }),
      ]);

      const total = (countResult[0] as any).total;

      if (idsResult.length === 0) {
        return { count: total, events: [] };
      }

      const bookingIds = idsResult.filter((r: any) => r.event_type === "booking").map((r: any) => r.id);
      const tripIds = idsResult.filter((r: any) => r.event_type === "trip").map((r: any) => r.id);

      const [bookings, trips] = await Promise.all([
        bookingIds.length > 0
          ? Booking.findAll({
              where: { id: { [Op.in]: bookingIds } },
              include: [{ association: "trip" }],
            })
          : [],
        tripIds.length > 0
          ? Trip.findAll({
              where: { id: { [Op.in]: tripIds } },
            })
          : [],
      ]);

      const bookingMap = new Map(bookings.map((b) => [b.id, b]));
      const tripMap = new Map(trips.map((t) => [t.id, t]));

      const events: UpcomingEvent[] = idsResult.map((row: any) => {
        if (row.event_type === "booking") {
          const booking = bookingMap.get(row.id);
          if (!booking) {
            throw new Error(`Booking ${row.id} not found`);
          }
          return {
            type: "booking" as const,
            data: booking,
          };
        } else {
          const trip = tripMap.get(row.id);
          if (!trip) {
            throw new Error(`Trip ${row.id} not found`);
          }
          return {
            type: "trip" as const,
            data: trip,
          };
        }
      });

      return { count: total, events };
    } catch (error) {
      throw error;
    }
  }
}
