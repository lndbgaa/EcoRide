import { Booking, Ride, User } from "@/models/mysql/index.js";
import PreferenceService from "@/services/preference.service.js";
import UserService from "@/services/user.service.js";
import VehicleService from "@/services/vehicle.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

import type { BookingPublicDTO } from "@/models/mysql/Booking.model.js";
import type { RidePublicDTO } from "@/models/mysql/Ride.model.js";
import type { MulterRequest } from "@/types/express.d.js";
import type { Request, Response } from "express";

/**
 * Gère la récupération des informations de profil d'un utilisateur
 */
export const getUserInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.params.id;

  const user: User = await UserService.getInfo(userId);

  return res.status(200).json({
    success: true,
    message: "Informations de profil récupérées avec succès.",
    data: user.toPublicDTO(),
  });
});

/**
 * Gère la récupération des informations de profil de l'utilisateur connecté
 */
export const getMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const user: User = await UserService.getInfo(userId);

  return res.status(200).json({
    success: true,
    message: "Informations de profil récupérées avec succès.",
    data: user.toPrivateDTO(),
  });
});

/**
 * Gère la mise à jour des informations de profil de l'utilisateur connecté
 */
export const updateMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;
  const data = req.body;

  const user: User = await UserService.updateInfo(userId, data);

  return res.status(200).json({
    success: true,
    message: "Informations de profil mises à jour avec succès.",
    data: user.toPrivateDTO(),
  });
});

/**
 * Gère la mise à jour du rôle de l'utilisateur connecté
 */
export const updateMyRole = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;
  const { role } = req.body;

  await UserService.updateRole(role, userId);

  return res.sendStatus(204);
});

/**
 * Gère la mise à jour de la photo de profil de l'utilisateur connecté
 */
export const updateMyAvatar = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const { file } = req;

  if (!file) {
    throw new AppError({
      statusCode: 400,
      statusText: "Bad Request",
      message: "Aucun fichier n'a été uploadé.",
    });
  }

  const { url } = await UserService.updateAvatar(file, userId);

  return res.status(200).json({
    success: true,
    message: "Photo de profil mise à jour avec succès.",
    data: { url },
  });
});

/**
 * Gère la récupération d'un véhicule par l'utilisateur connecté
 */
export const getMyVehicles = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const vehicles = await VehicleService.getUserVehicles(userId);

  const dto = vehicles.map((vehicle) => vehicle.toPrivateDTO());

  return res.status(200).json({
    success: true,
    message: "Véhicules récupérés avec succès.",
    data: dto,
  });
});

/**
 * Gère la récupération des préférences de l'utilisateur connecté
 */
export const getMyPreferences = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const preferences = await PreferenceService.getPreferences(userId);

  const dto = preferences.map((preference) => preference.toPrivateDTO());

  return res.status(200).json({
    success: true,
    message: "Préférences récupérées avec succès.",
    data: dto,
  });
});

/**
 * Gère la récupération du prochain événement à venir de l'utilisateur connecté
 */
export const getMyNextEvent = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const nextEvent: Booking | Ride | null = await UserService.getNextEvent(userId);

  if (!nextEvent) {
    return res.status(200).json({
      success: true,
      message: "Aucun événement à venir.",
    });
  }

  const dto: BookingPublicDTO | RidePublicDTO = nextEvent.toPublicDTO();

  return res.status(200).json({
    success: true,
    message: "Prochain événement récupéré avec succès.",
    type: nextEvent instanceof Booking ? "booking" : "ride",
    data: dto,
  });
});

/**
 * Gère la récupération des événements à venir de l'utilisateur connecté
 */
export const getMyUpcomingEvents = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user.id;

  const upcomingEvents = await UserService.getUpcomingEvents(userId);

  if (upcomingEvents.length === 0) {
    return res.status(200).json({
      success: true,
      message: "Aucun évènement à venir",
    });
  }

  const dto: ((BookingPublicDTO | RidePublicDTO) & { type: "booking" | "ride" })[] = upcomingEvents.map((event) => {
    const { data, type } = event;
    const baseDto = data.toPublicDTO();

    return {
      ...baseDto,
      type,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Événements à venir récupérés avec succès.",
    data: dto,
  });
});
