import {
  COMMON_ERROR_MESSAGES,
  INCIDENT_ERROR_MESSAGES,
  PLATFORM_FEE_PER_SEAT,
} from "@/constants";
import { Incident } from "@/models";
import { TripService, UserService } from "@/services";
import { AppError } from "@/utils";

import type { Booking, User } from "@/models";
import type {
  GetIncidentsFilters,
  GetIncidentsSortOptions,
  IncidentDBFilter,
  IncidentDocument,
  TripEmbedded,
  UserEmbedded,
} from "@/types";

export class IncidentService {
  /**
   * Finds an incident by ID.
   *
   * @param {string} incidentId - The ID of the incident.
   * @returns {Promise<IncidentDocument>} - The returned incident document.
   * @throws {AppError} - If:
   *   - The incident is not found (HTTP 404).
   */
  public static async findById(
    incidentId: string
  ): Promise<IncidentDocument> {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new AppError({
        statusCode: 404,
        userMessageKey: COMMON_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        debugMessage: `[IncidentService.findById] Incident '${incidentId}' not found in database.`,
      });
    }

    return incident;
  }

  /**
   * Retrieves all incidents with pagination, optional filters, and sorting.
   *
   * @param {number} limit - The maximum number of incidents to return.
   * @param {number} offset - The number of incidents to skip (for pagination).
   * @param {GetIncidentsFilters} [filters] - Optional filters (status, moderatorId).
   * @param {GetIncidentsSortOptions} [sortOptions] - Optional sort options (by: "createdAt" | "assignedAt" | "resolvedAt", dir: "asc" | "desc").
   * @returns {Promise<{ count: number; incidents: IncidentDocument[] }>} - An object containing the total count and the list of incidents.
   */
  public static async findAll(
    limit: number,
    offset: number,
    filters?: GetIncidentsFilters,
    sortOptions?: GetIncidentsSortOptions
  ): Promise<{ count: number; incidents: IncidentDocument[] }> {
    const query: IncidentDBFilter = {};

    if (filters?.status) query.status = filters.status;
    if (filters?.moderatorId)
      query["assignment.to.id"] = filters.moderatorId;

    const sortFieldMap: Record<string, string> = {
      createdAt: "createdAt",
      assignedAt: "assignment.at",
      resolvedAt: "resolution.at",
    };

    const sortField =
      sortFieldMap[sortOptions?.by ?? "createdAt"] ?? "createdAt";

    const sortDirection = sortOptions?.dir === "asc" ? 1 : -1;

    const [incidents, count] = await Promise.all([
      Incident.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ [sortField]: sortDirection }),
      Incident.countDocuments(query),
    ]);

    return { count, incidents };
  }

  /**
   * Creates an incident related to a booking for a trip that went wrong.
   *
   * @param {User} user - The user instance reporting the incident.
   * @param {Booking} booking - The related booking.
   * @param {string} description - The description of the incident.
   * @returns {IncidentDocument} The newly created incident document.
   * @throws {AppError} - If:
   *   - The trip is not found (HTTP 404, thrown by TripService.findById).
   *   - The trip is not completed (HTTP 409).
   *   - The user has already reported an incident for this trip (HTTP 409).
   *   - Required relations (driver) are missing (HTTP 500).
   */
  public static async create(
    user: User,
    booking: Booking,
    description: string
  ): Promise<IncidentDocument> {
    const trip = await TripService.findById(booking.trip_id, {
      include: { association: "driver" },
    });

    if (!trip.isCompleted()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: INCIDENT_ERROR_MESSAGES.CREATE.TRIP_NOT_COMPLETED,
        debugMessage: `[IncidentService.create] Cannot create Incident: Trip '${trip.id}' is not completed (current status: '${trip.status}').`,
      });
    }

    if (!trip.driver) {
      throw new AppError({
        statusCode: 500,
        userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        debugMessage: `[IncidentService.create] Cannot create Incident: Missing relations for Trip '${trip.id}'.`,
      });
    }

    const existingIncident = !!(await Incident.exists({
      "trip.id": trip.id,
      "passenger.id": user.id,
    }));

    if (existingIncident) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: INCIDENT_ERROR_MESSAGES.CREATE.ALREADY_REPORTED,
        debugMessage: `[IncidentService.create] Cannot create Incident: User '${user.id}' has already reported an incident for Trip '${trip.id}'.`,
      });
    }

    const tripData: TripEmbedded = {
      id: trip.id,
      departureLocation: trip.departure_location,
      arrivalLocation: trip.arrival_location,
      departureDatetime: trip.departure_datetime,
      arrivalDatetime: trip.arrival_datetime,
      driver: {
        id: trip.driver.id,
        email: trip.driver.email,
        username: trip.driver.username,
        firstName: trip.driver.first_name ?? undefined,
        lastName: trip.driver.last_name ?? undefined,
        phone: trip.driver.phone ?? undefined,
      },
    };

    const passengerData: UserEmbedded = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name ?? undefined,
      lastName: user.last_name ?? undefined,
      phone: user.phone ?? undefined,
    };

    const seatsBooked = booking.seats_booked;
    const totalPrice = seatsBooked * trip.price;
    const platformFee = PLATFORM_FEE_PER_SEAT * seatsBooked;
    const amountInDispute = totalPrice - platformFee;

    const incident = await Incident.create({
      description,
      trip: tripData,
      passenger: passengerData,
      amountInDispute,
    });

    return incident;
  }

  /**
   * Assigns an incident to a moderator.
   *
   * @param {string} incidentId - The ID of the incident to assign.
   * @param {User} moderator - The moderator to assign the incident to.
   * @throws {AppError} - If:
   *   - The incident is not found (HTTP 404, thrown by this.findById).
   *   - The incident is already resolved (HTTP 409).
   *   - The incident is already assigned to this moderator (HTTP 409).
   *   - The incident is already assigned to another moderator (HTTP 409).
   */
  public static async assign(
    incidentId: string,
    moderator: User
  ): Promise<void> {
    const incident = await this.findById(incidentId);

    if (incident.isResolved()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: INCIDENT_ERROR_MESSAGES.ASSIGN.ALREADY_RESOLVED,
        debugMessage: `[IncidentService.assign] Cannot assign Incident '${incidentId}': Incident is already resolved.`,
      });
    }

    const alreadyAssignedTo = incident.assignment;

    if (alreadyAssignedTo) {
      if (alreadyAssignedTo.to.id === moderator.id) {
        throw new AppError({
          statusCode: 409,
          userMessageKey:
            INCIDENT_ERROR_MESSAGES.ASSIGN.ALREADY_ASSIGNED_TO_USER,
          debugMessage: `[IncidentService.assign] Cannot assign Incident '${incidentId}': Incident is already assigned to this moderator '${moderator.id}'.`,
        });
      }

      throw new AppError({
        statusCode: 409,
        userMessageKey:
          INCIDENT_ERROR_MESSAGES.ASSIGN.ALREADY_ASSIGNED_TO_OTHER,
        debugMessage: `[IncidentService.assign] Cannot assign Incident '${incidentId}': Incident is already assigned to another moderator '${alreadyAssignedTo.to.id}'.`,
      });
    }

    const moderatorData: UserEmbedded = {
      id: moderator.id,
      email: moderator.email,
      username: moderator.username,
    };

    await incident.markAsAssigned(moderatorData);
  }

  /**
   * Resolves an assigned incident.
   *
   * @param {string} incidentId - The ID of the incident to resolve.
   * @param {User} moderator - The moderator performing the resolution.
   * @param {string} note - The resolution note to record.
   * @throws {AppError} - If:
   *   - The incident is not found (HTTP 404, thrown by this.findById).
   *   - The incident is already resolved (HTTP 409).
   *   - The incident is not assigned (HTTP 409).
   *   - The incident is assigned to another moderator (HTTP 409).
   */
  public static async resolve(
    incidentId: string,
    moderator: User,
    note: string
  ): Promise<void> {
    const incident: IncidentDocument = await this.findById(incidentId);

    if (incident.isResolved()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: INCIDENT_ERROR_MESSAGES.RESOLVE.ALREADY_RESOLVED,
        debugMessage: `[IncidentService.resolve] Cannot resolve Incident '${incidentId}': Incident is already resolved.`,
      });
    }

    if (!incident.isAssigned()) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: INCIDENT_ERROR_MESSAGES.RESOLVE.NOT_ASSIGNED,
        debugMessage: `[IncidentService.resolve] Cannot resolve Incident '${incidentId}': Incident is not assigned to any moderator.`,
      });
    }

    if (incident.assignment?.to.id !== moderator.id) {
      throw new AppError({
        statusCode: 409,
        userMessageKey: INCIDENT_ERROR_MESSAGES.RESOLVE.ASSIGNED_TO_OTHER,
        debugMessage: `[IncidentService.resolve] Cannot resolve Incident '${incidentId}': Incident is assigned to another moderator '${incident.assignment?.to.id}'.`,
      });
    }

    const driver = await UserService.findById(incident.trip.driver.id);

    await incident.markAsResolved(note);
    await driver.addCredits(incident.amountInDispute);
  }
}
