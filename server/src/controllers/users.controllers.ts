import type { User, Vehicle } from "@/models/mysql";
import type { MulterRequest } from "@/types/express.js";
import type { Request, Response } from "express";

import BookingService from "@/services/booking.service.js";
import PreferenceService from "@/services/preference.service.js";
import ReviewService from "@/services/review.service.js";
import RideService from "@/services/ride.service.js";
import UserService from "@/services/user.service.js";
import VehicleService from "@/services/vehicle.service.js";
import AppError from "@/utils/AppError.js";
import catchAsync from "@/utils/catchAsync.js";

/**
 * Gère la récupération des informations de profil d'un utilisateur
 */
export const getUserInfo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const user: User = await UserService.getUserInfo(userId);

    res.status(200).json({
      success: true,
      message: "Informations de profil récupérées avec succès.",
      data: user.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour des informations de profil d'un utilisateur
 */
export const updateUserInfo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    const user: User = await UserService.updateInfo(userId, data);

    res.status(200).json({
      success: true,
      message: "Informations de profil modifiées avec succès.",
      data: user.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour du rôle d'un utilisateur
 */
export const updateUserRole = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { role } = req.body;

    await UserService.updateRole(role, userId);

    res
      .status(200)
      .json({ success: true, message: "Rôle mis à jour avec succès." });
  }
);

/**
 * Gère la mise à jour de la photo de profil d'un utilisateur
 */
export const updateUserAvatar = catchAsync(
  async (req: MulterRequest, res: Response): Promise<void> => {
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

    res.status(200).json({
      success: true,
      message: "Photo de profil mise à jour avec succès.",
      data: { avatar: url },
    });
  }
);

/**
 * Gère la récupération des véhicules d'un utilisateur (chauffeur)
 */
export const getUserVehicles = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const vehicles: Vehicle[] = await VehicleService.getUserVehicles(userId);

    res.status(200).json({
      success: true,
      message: "Véhicules récupérés avec succès.",
      data: vehicles.map((vehicle) => vehicle.toPrivateDTO()),
    });
  }
);

/**
 * Gère la création d'un véhicule par un utilisateur (chauffeur)
 */
export const addVehicle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    const vehicle: Vehicle = await VehicleService.createVehicle(userId, data);

    res.status(201).json({
      success: true,
      message: "Véhicule créé avec succès.",
      data: vehicle.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour d'un véhicule par un utilisateur (chauffeur)
 */
export const updateVehicle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const vehicleId = req.params.vehicleId;
    const data = req.body;

    const updatedVehicle: Vehicle = await VehicleService.updateVehicle(
      userId,
      vehicleId,
      data
    );

    res.status(200).json({
      success: true,
      message: "Véhicule mis à jour avec succès.",
      data: updatedVehicle.toPrivateDTO(),
    });
  }
);

/**
 * Gère la suppression d'un véhicule par un utilisateur (chauffeur)
 */
export const deleteVehicle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const vehicleId = req.params.vehicleId;

    await VehicleService.deleteVehicle(userId, vehicleId);

    res
      .status(200)
      .json({ success: true, message: "Véhicule supprimé avec succès." });
  }
);

/**
 * Gère la récupération des préférences d'un utilisateur (chauffeur)
 */
export const getUserPreferences = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const preferences = await PreferenceService.getPreferences(userId);

    res.status(200).json({
      success: true,
      message: "Préférences récupérées avec succès.",
      data: preferences.map((preference) => preference.toPrivateDTO()),
    });
  }
);

/**
 * Gère l'ajout d'une préférence par un utilisateur (chauffeur)
 */
export const addPreference = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const data = req.body;

    const preference = await PreferenceService.createPreference(userId, data);

    res.status(201).json({
      success: true,
      message: "Préférence ajoutée avec succès.",
      data: preference.toPrivateDTO(),
    });
  }
);

/**
 * Gère la mise à jour de la valeur d'une préférence par un utilisateur (chauffeur)
 */
export const updatePreference = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const preferenceId = req.params.preferenceId;

    const updatedPreference = await PreferenceService.togglePreferenceValue(
      userId,
      preferenceId
    );

    res.status(200).json({
      success: true,
      message: "Préférence mise à jour avec succès.",
      data: updatedPreference.toPrivateDTO(),
    });
  }
);

/**
 * Gère la suppression d'une préférence par un utilisateur (chauffeur)
 */
export const deletePreference = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const preferenceId = req.params.preferenceId;

    await PreferenceService.deletePreference(userId, preferenceId);

    res
      .status(200)
      .json({ success: true, message: "Préférence supprimée avec succès." });
  }
);

/**
 * Gère la récupération des trajets d'un utilisateur
 */
export const getUserRides = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const rides = await RideService.getUserRides(userId);

    res.status(200).json({
      success: true,
      message: "Historique des trajets récupérés avec succès.",
      data: rides.map((ride) => ride.toPrivateDTO()),
    });
  }
);

/**
 * Gère la récupération des réservations d'un utilisateur
 */
export const getUserBookings = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    const bookings = await BookingService.getUserBookings(userId);

    res.status(200).json({
      success: true,
      message: "Historique des réservations récupéré avec succès.",
      data: bookings.map((booking) => booking.toPrivateDTO()),
    });
  }
);

/**
 * Gère la récupération des avis reçus par un utilisateur
 */
export const getUserReceivedReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { count, reviews } = await ReviewService.getUserReceivedReviews(
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Historique des avis reçus récupéré avec succès.",
      data: reviews.map((review) => review.toPrivateDTO()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  }
);

/**
 * Gère la récupération des avis écrits par un utilisateur
 */
export const getUserWrittenReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { count, reviews } = await ReviewService.getUserWrittenReviews(
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Historique des avis écrits récupéré avec succès.",
      data: reviews.map((review) => review.toPrivateDTO()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  }
);
