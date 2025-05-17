import Joi from "joi";

/**
 * Validation des données passées pour la création d'une réservation
 */
export const createBookingSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet à réserver est requis.",
    "string.empty": "L'id du trajet à réserver doit être une chaîne de caractères non vide.",
    "string.base": "L'id du trajet à réserver doit être une chaîne de caractères.",
    "string.guid": "L'id du trajet à réserver doit être un identifiant valide.",
  }),
  seats: Joi.number().integer().min(1).max(1).required().messages({
    "any.required": "Le nombre de places à réserver est requis.",
    "number.integer": "Le nombre de places à réserver doit être un nombre entier.",
    "number.min": "Le nombre de places à réserver doit être supérieur à 0.",
    "number.max": "Le nombre de places à réserver ne peut pas dépasser 1.",
  }),
});

/**
 * Validation des données passées pour la confirmation d'une réservation avec un incident
 */
export const confirmBookingWithIncidentSchema = Joi.object({
  description: Joi.string().min(10).max(500).required().messages({
    "any.required": "La description de l'incident est requise.",
    "string.empty": "La description de l'incident doit être une chaîne de caractères non vide.",
    "string.min": "La description de l'incident doit contenir au moins 10 caractères.",
    "string.max": "La description de l'incident doit contenir au maximum 500 caractères.",
  }),
});
