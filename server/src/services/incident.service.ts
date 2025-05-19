import { PLATFORM_CREDITS_PER_SEAT } from "@/constants/index.js";

import Incident from "@/models/mongo/Incident.model.js";
import Booking from "@/models/mysql/Booking.model.js";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

import type { IncidentDocument } from "@/models/mongo/Incident.model.js";
import type { IncidentStatus } from "@/types/index.js";

class IncidentService {
  /**
   * Crée un incident pour un trajet
   * @param userId - L'identifiant de l'utilisateur qui signale l'incident
   * @param data - Les données de l'incident
   */
  public static async createIncident(userId: string, booking: Booking, description: string): Promise<void> {
    const user = await UserService.findUserOrThrow(userId);
    const ride = await RideService.findRideOrThrow(booking.getRideId(), {
      include: { association: "driver" },
    });

    if (!ride.isCompleted()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Impossible de signaler un incident sur ce trajet.",
      });
    }

    const hasAlreadyReported = !!(await Incident.exists({
      "ride.id": ride.getId(),
      "passenger.email": user.getEmail(),
    }));

    if (hasAlreadyReported) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Vous avez déjà signalé un incident pour ce trajet.",
      });
    }

    await Incident.create({
      description,
      ride: {
        id: ride.getId(),
        departureLocation: ride.getDepartureLocation(),
        arrivalLocation: ride.getArrivalLocation(),
        departureDate: ride.getDepartureDate(),
        arrivalDate: ride.getArrivalDate(),
        price: ride.getPrice(),
      },
      passenger: {
        id: user.getId(),
        email: user.getEmail(),
        pseudo: user.getPseudo(),
      },
      driver: {
        id: ride.driver?.getId() ?? "",
        email: ride.driver?.getEmail() ?? "",
        pseudo: ride.driver?.getPseudo() ?? "",
      },
      rewardAmount: booking.getSeatsBooked() * ride.getPrice() - PLATFORM_CREDITS_PER_SEAT * booking.getSeatsBooked(),
    });
  }

  /**
   * Récupère une liste d'incidents par statut
   * @param status - Le statut des incidents
   * @param limit
   * @param offset
   * @returns Les incidents + le nombre total d'incidents
   */
  public static async getIncidentsByStatus(
    status: IncidentStatus,
    limit: number,
    offset: number
  ): Promise<{ count: number; incidents: IncidentDocument[] }> {
    const incidents = await Incident.find({ status }).skip(offset).limit(limit).sort({ createdAt: -1 });

    const count = await Incident.countDocuments({ status });

    return { count, incidents };
  }

  /**
   * Récupère un incident par son id
   * @param incidentId - L'identifiant de l'incident
   * @returns L'incident
   */
  public static async getIncidentById(incidentId: string): Promise<IncidentDocument> {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Incident non trouvé.",
      });
    }

    return incident;
  }

  /**
   * Assigne un incident à un employé
   * @param incidentId - L'identifiant de l'incident
   * @param employeeId - L'identifiant de l'employé
   */
  public static async assignIncident(incidentId: string, employeeId: string): Promise<void> {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Incident non trouvé.",
      });
    }

    if (incident.isResolved()) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Cet incident est déjà résolu.",
      });
    }

    const alreadyAssignedTo = incident.getAssignedTo();

    if (alreadyAssignedTo) {
      if (alreadyAssignedTo === employeeId) {
        throw new AppError({
          statusCode: 409,
          statusText: "Conflict",
          message: "L'incident vous est déjà assigné.",
        });
      }

      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Cet incident est déjà assigné à un autre employé.",
      });
    }

    incident.markAsAssigned(employeeId);

    await incident.save();
  }

  /**
   * Résout un incident
   * @param incidentId - L'identifiant de l'incident
   * @param employeeId - L'identifiant de l'employé qui résout l'incident
   * @param note - La note de résolution
   */
  public static async resolveIncident(incidentId: string, employeeId: string, note: string): Promise<void> {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Incident non trouvé.",
      });
    }

    if (incident.isResolved()) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Cet incident est déjà résolu.",
      });
    }

    if (!incident.isAssigned()) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Cet incident n'est pas assigné à un employé.",
      });
    }

    if (incident.getAssignedTo() !== employeeId) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Cet incident ne vous est pas attribué.",
      });
    }

    const driver = await UserService.findUserOrThrow(incident.getDriverId());

    incident.markAsResolved(note);
    await incident.save();

    await driver.addCredits(incident.getRewardAmount());
  }

  /**
   * Récupère les incidents d'un employé par statut
   * @param employeeId - L'identifiant de l'employé
   * @param status - Le statut des incidents (assigned ou resolved)
   * @param limit
   * @param offset
   * @returns Les incidents liés à l'employé + le nombre total d'incidents
   */
  public static async getEmployeeIncidents(
    employeeId: string,
    status: Omit<IncidentStatus, "pending">,
    limit: number,
    offset: number
  ): Promise<{ count: number; incidents: IncidentDocument[] }> {
    const findOptions: Record<string, any> = { assignedTo: employeeId };

    if (status) findOptions.status = status;

    const incidents = await Incident.find(findOptions).skip(offset).limit(limit).sort({ createdAt: -1 });

    const count = await Incident.countDocuments(findOptions);

    return { count, incidents };
  }
}

export default IncidentService;
