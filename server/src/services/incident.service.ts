import Incident from "@/models/mongo/Incident.model.js";
import BookingService from "@/services/booking.service.js";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

import type { IncidentType } from "@/models/mongo/Incident.model.js";

interface CreateIncidentData {
  rideId: string;
  type: IncidentType;
  description: string;
}

class IncidentService {
  public static async createIncident(userId: string, data: CreateIncidentData) {
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
      type: data.type,
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
}

export default IncidentService;
