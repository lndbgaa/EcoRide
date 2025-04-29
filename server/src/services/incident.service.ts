import Incident from "@/models/mongo/Incident.model.js";
import BookingService from "@/services/booking.service.js";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

import type {
  IncidentDocument,
  IncidentStatus,
} from "@/models/mongo/Incident.model.js";

interface CreateIncidentData {
  rideId: string;
  description: string;
}

class IncidentService {
  /**
   * Crée un incident pour un trajet
   * @param userId - L'identifiant de l'utilisateur qui signale l'incident
   * @param data - Les données de l'incident
   */
  public static async createIncident(
    userId: string,
    data: CreateIncidentData
  ): Promise<void> {
    const user = await UserService.findUserOrThrow(userId);
    const ride = await RideService.findRideOrThrow(data.rideId, {
      include: { association: "driver" },
    });

    if (ride.getDriverId() === userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message:
          "Vous ne pouvez pas signaler un incident pour votre propre trajet.",
      });
    }

    if (!ride.isCompleted()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Impossible de signaler un incident sur ce trajet.",
      });
    }

    const rideBookings = await BookingService.getRideBookings(ride.getId(), {
      where: { status: "completed" },
    });

    const isRidePassenger = rideBookings.some(
      (booking) => booking.getPassengerId() === userId
    );

    if (!isRidePassenger) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message:
          "Vous n'êtes pas autorisé à signaler un incident sur ce trajet.",
      });
    }

    const hasAlreadyReported = !!(await Incident.exists({
      "ride.id": data.rideId,
      "passenger.email": user.getEmail(),
    }));

    if (hasAlreadyReported) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message:
          "Vous avez déjà signalé un incident pour ce trajet. Celui-ci est en cours de traitement.",
      });
    }

    await Incident.create({
      description: data.description,
      ride: {
        id: ride.getId(),
        departureLocation: ride.getDepartureLocation(),
        arrivalLocation: ride.getArrivalLocation(),
        departureDate: ride.getDepartureDate(),
      },
      passenger: {
        email: user.getEmail(),
        pseudo: user.getPseudo(),
      },
      driver: {
        email: ride.driver?.getEmail() ?? "",
        pseudo: ride.driver?.getPseudo() ?? "",
      },
    });
  }

  /**
   * Assigne un incident à un employé
   * @param incidentId - L'identifiant de l'incident
   * @param employeeId - L'identifiant de l'employé
   */
  public static async assignIncident(
    incidentId: string,
    employeeId: string
  ): Promise<void> {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Incident non trouvé.",
      });
    }

    if (!incident.isPending()) {
      throw new AppError({
        statusCode: 409,
        statusText: "Conflict",
        message: "Cet incident est déjà en cours de traitement ou résolu.",
      });
    }

    incident.markAsAssigned(employeeId);

    await incident.save();
  }

  /**
   * Résout un incident
   * @param incidentId - L'identifiant de l'incident
   * @param employeeId - L'identifiant de l'employé
   * @param note - La note de résolution
   */
  public static async resolveIncident(
    incidentId: string,
    employeeId: string,
    note: string
  ): Promise<void> {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Incident non trouvé.",
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
        message: "Cet incident ne vous est pas assigné.",
      });
    }

    incident.markAsResolved(note);

    await incident.save();
  }

  /**
   * Récupère les incidents
   * @param employeeId - L'identifiant de l'employé
   * @param status - Le statut des incidents
   * @param page - La page à récupérer
   * @param limit - Le nombre d'incidents par page
   */
  public static async getIncidentsByStatus(
    limit: number,
    offset: number,
    status: IncidentStatus
  ): Promise<{ count: number; incidents: IncidentDocument[] }> {
    const incidents = await Incident.find({ status })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await Incident.countDocuments({ status });

    return { count, incidents };
  }

  /**
   * Récupère un incident par son id
   * @param employeeId - L'identifiant de l'employé qui visualise l'incident
   * @param incidentId - L'identifiant de l'incident
   * @returns L'incident
   */
  public static async getIncidentById(
    employeeId: string,
    incidentId: string
  ): Promise<IncidentDocument> {
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
        statusCode: 403,
        statusText: "Forbidden",
        message: "Cet incident est résolu et ne peut plus être consulté.",
      });
    }

    if (!incident.isPending() && incident.getAssignedTo() !== employeeId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message:
          "Cet incident est déjà pris en charge par un autre employé et ne peut pas être consulté.",
      });
    }

    return incident;
  }

  /**
   * Récupère les incidents d'un employé par statut
   * @param employeeId - L'identifiant de l'employé
   * @param status - Le statut des incidents
   * @param page - La page à récupérer
   * @param limit - Le nombre d'incidents par page
   */
  public static async getEmployeeIncidents(
    employeeId: string,
    limit: number,
    offset: number,
    status?: IncidentStatus
  ): Promise<{ count: number; incidents: IncidentDocument[] }> {
    const findOptions: Record<string, any> = { assignedTo: employeeId };

    if (status) findOptions.status = status;

    const incidents = await Incident.find(findOptions)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await Incident.countDocuments(findOptions);

    return { count, incidents };
  }
}

export default IncidentService;
