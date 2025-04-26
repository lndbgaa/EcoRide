import Joi from "joi";

/**
 * Schéma de validation pour l'id d'un trajet
 */
export const rideIdParamSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet est requis.",
    "string.base": "L'id du trajet doit être une chaîne de caractères.",
    "string.empty": "L'id du trajet est requis.",
    "string.guid": "L'id du trajet doit être un UUID valide.",
  }),
});

export const createRideSchema = Joi.object({
  departureLocation: Joi.string().trim().max(255).required().messages({
    "any.required": "Le lieu de départ est requis.",
    "string.base": "Le lieu de départ doit être une chaîne de caractères.",
    "string.empty": "Le lieu de départ est requis.",
    "string.max": "Le lieu de départ doit contenir au maximum 255 caractères.",
  }),
  departureDatetime: Joi.date().required().messages({
    "any.required": "La date et l'heure de départ sont requises.",
    "date.base": "La date et l'heure de départ doivent être une date valide.",
    "date.empty": "La date et l'heure de départ sont requises.",
  }),
  arrivalLocation: Joi.string().trim().max(255).required().messages({
    "any.required": "Le lieu d'arrivée est requis.",
    "string.base": "Le lieu d'arrivée doit être une chaîne de caractères.",
    "string.empty": "Le lieu d'arrivée est requis.",
    "string.max": "Le lieu d'arrivée doit contenir au maximum 255 caractères.",
  }),
  arrivalDatetime: Joi.date().required().messages({
    "any.required": "La date et l'heure d'arrivée sont requises.",
    "date.base": "La date et l'heure d'arrivée doivent être une date valide.",
    "date.empty": "La date et l'heure d'arrivée sont requises.",
  }),
  vehicleId: Joi.string().uuid().required().messages({
    "any.required": "L'id du véhicule est requis.",
    "string.base": "L'id du véhicule doit être une chaîne de caractères.",
    "string.empty": "L'id du véhicule est requis.",
    "string.guid": "L'id du véhicule doit être un UUID valide.",
  }),
  price: Joi.number().integer().strict().min(10).max(500).required().messages({
    "any.required": "Le prix est requis.",
    "number.integer": "Le prix doit être un nombre entier.",
    "number.min": "Le prix doit être au minimum de 10 crédits (1€).",
    "number.max": "Le prix doit être au maximum de 500 crédits (50 €).",
  }),
  offeredSeats: Joi.number().integer().strict().min(1).max(6).required().messages({
    "any.required": "Le nombre de places proposées est requis.",
    "number.integer": "Le nombre de places proposées doit être un nombre entier.",
    "number.min": "Le nombre de places proposées doit être au minimum de 1.",
    "number.max": "Le nombre de places proposées doit être au maximum de 6.",
  }),
});

export const searchRidesSchema = Joi.object({
  departureLocation: Joi.string().max(255).required().messages({
    "any.required": "Le lieu de départ est requis.",
    "string.base": "Le lieu de départ doit être une chaîne de caractères.",
    "string.empty": "Le lieu de départ est requis.",
    "string.max": "Le lieu de départ doit contenir au maximum 255 caractères.",
  }),
  arrivalLocation: Joi.string().max(255).required().messages({
    "any.required": "Le lieu d'arrivée est requis.",
    "string.base": "Le lieu d'arrivée doit être une chaîne de caractères.",
    "string.empty": "Le lieu d'arrivée est requis.",
    "string.max": "Le lieu d'arrivée doit contenir au maximum 255 caractères.",
  }),
  departureDate: Joi.date().required().messages({
    "any.required": "La date de départ est requise.",
    "date.base": "La date de départ doit être une date valide.",
    "date.empty": "La date de départ est requise.",
  }),
  isEcoFriendly: Joi.boolean().optional(),
  maxPrice: Joi.number().integer().strict().min(10).max(500).optional(),
  minRating: Joi.number().integer().strict().min(1).max(5).optional(),
  maxDuration: Joi.number().integer().strict().min(1).max(12).optional(),
});
