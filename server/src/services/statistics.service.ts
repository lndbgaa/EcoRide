import { col, fn, literal, Op } from "sequelize";

import { PLATFORM_CREDITS_PER_SEAT } from "@/constants/index.js";
import { Booking, Ride } from "@/models/mysql";

class StatisticsService {
  /**
   * Récupère le nombre de trajets prévus par jour
   * @returns Un tableau de dates et de nombres de trajets prévus
   */
  public static async getDailyRides(): Promise<
    { date: string; count: number }[]
  > {
    const rows = (await Ride.findAll({
      attributes: [
        [fn("DATE", col("departure_datetime")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    })) as unknown as { date: string; count: string }[];

    return rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  /**
   * Récupère le nombre de crédits générés par la plateforme par jour
   *
   * Note : que le trajet soit en attente de feedback du passager, ou complètement terminé la plateforme gagne des crédits
   *
   * @returns Un tableau de dates et de nombres de crédits générés par la plateforme
   */
  public static async getDailyCredits(): Promise<
    { date: string; credits: number }[]
  > {
    const rows = (await Booking.findAll({
      attributes: [
        [fn("DATE", col("ride.departure_datetime")), "date"],
        [
          literal(`SUM(seats_booked * ${PLATFORM_CREDITS_PER_SEAT})`),
          "credits",
        ],
      ],
      include: [{ association: "ride", attributes: [], required: true }],
      where: {
        status: { [Op.in]: ["awaiting_feedback", "completed"] },
      },
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    })) as unknown as { date: string; credits: string }[];

    return rows.map((r) => ({
      date: r.date,
      credits: Number(r.credits),
    }));
  }

  /**
   * Récupère le nombre total de crédits générés par la plateforme
   *
   * Note : que le trajet soit en attente de feedback du passager, ou complètement terminé la plateforme gagne des crédits
   *
   * @returns Le nombre total de crédits générés par la plateforme
   */
  public static async getTotalCredits(): Promise<number> {
    const result = await Booking.sum("seats_booked", {
      where: { status: { [Op.in]: ["awaiting_feedback", "completed"] } },
    });

    return (result * PLATFORM_CREDITS_PER_SEAT) | 0;
  }
}

export default StatisticsService;
