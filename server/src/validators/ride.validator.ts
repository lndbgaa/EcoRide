import dayjs from "dayjs";
import Joi from "joi";

/**
 * Schéma de validation des données passées pour la création d'un trajet
 */
export const createRideSchema = Joi.object({
  departureLocation: Joi.string().trim().max(255).required().messages({
    "any.required": "Le lieu de départ est requis.",
    "string.base": "Le lieu de départ doit être une chaîne de caractères non vide.",
    "string.empty": "Le lieu de départ doit être une chaîne de caractères non vide.",
    "string.max": "Le lieu de départ doit contenir au maximum 255 caractères.",
  }),
  departureDate: Joi.date().required().messages({
    "any.required": "La date de départ est requise.",
    "date.base": "La date de départ doit être une date valide.",
  }),
  departureTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "any.required": "L'heure de départ est requise.",
      "string.pattern.base": "L'heure de départ doit être au format HH:mm (ex: 14:30).",
      "string.empty": "L'heure de départ ne peut pas être vide.",
    }),
  arrivalLocation: Joi.string().trim().max(255).required().messages({
    "any.required": "Le lieu d'arrivée est requis.",
    "string.base": "Le lieu d'arrivée doit être une chaîne de caractères non vide.",
    "string.empty": "Le lieu d'arrivée doit être une chaîne de caractères non vide.",
    "string.max": "Le lieu d'arrivée doit contenir au maximum 255 caractères.",
  }),
  arrivalDate: Joi.date().required().messages({
    "any.required": "La date d'arrivée est requise.",
    "date.base": "La date d'arrivée doit être une date valide.",
  }),
  arrivalTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "any.required": "L'heure d'arrivée est requise.",
      "string.pattern.base": "L'heure d'arrivée doit être au format HH:mm (ex: 14:30).",
      "string.empty": "L'heure d'arrivée ne peut pas être vide.",
    }),
  vehicleId: Joi.string().uuid().required().messages({
    "any.required": "L'id du véhicule est requis.",
    "string.base": "L'id du véhicule doit être une chaîne de caractères.",
    "string.empty": "L'id du véhicule doit être une chaîne de caractères non vide.",
    "string.guid": "L'id du véhicule doit être un identifiant valide.",
  }),
  price: Joi.number().integer().strict().min(10).max(500).required().messages({
    "any.required": "Le prix est requis.",
    "number.integer": "Le prix doit être un nombre entier.",
    "number.min": "Le prix doit être au minimum de 10 crédits (1€).",
    "number.max": "Le prix doit être au maximum de 500 crédits (50 €).",
  }),
  offeredSeats: Joi.number().integer().strict().min(1).max(4).required().messages({
    "any.required": "Le nombre de places proposées est requis.",
    "number.integer": "Le nombre de places proposées doit être un nombre entier.",
    "number.min": "Le nombre de places proposées doit être au minimum de 1.",
    "number.max": "Le nombre de places proposées doit être au maximum de 4.",
  }),
}).custom((value, helpers) => {
  const departure = dayjs(`${value.departureDate}T${value.departureTime}`);
  const arrival = dayjs(`${value.arrivalDate}T${value.arrivalTime}`);

  if (departure.isBefore(dayjs())) {
    return helpers.error("any.custom", { message: "L'heure de départ ne peut pas être dans le passé." });
  }

  if (arrival.isBefore(departure)) {
    return helpers.error("any.custom", { message: "L'heure d'arrivée doit être postérieure à l'heure de départ." });
  }

  return value;
});

/**
 * Schéma de validation des données passées pour la recherche de trajets
 */
export const searchRidesSchema = Joi.object({
  departureLocation: Joi.string().trim().max(255).required().messages({
    "any.required": "Le lieu de départ est requis.",
    "string.base": "Le lieu de départ doit être une chaîne de caractères non vide.",
    "string.empty": "Le lieu de départ doit être une chaîne de caractères non vide.",
    "string.max": "Le lieu de départ doit contenir au maximum 255 caractères.",
  }),
  arrivalLocation: Joi.string().trim().max(255).required().messages({
    "any.required": "Le lieu d'arrivée est requis.",
    "string.base": "Le lieu d'arrivée doit être une chaîne de caractères non vide.",
    "string.empty": "Le lieu d'arrivée doit être une chaîne de caractères non vide.",
    "string.max": "Le lieu d'arrivée doit contenir au maximum 255 caractères.",
  }),
  departureDate: Joi.date().required().messages({
    "any.required": "La date de départ est requise.",
    "date.base": "La date de départ doit être une date valide.",
  }),
  isEcoFriendly: Joi.boolean().optional().messages({
    "boolean.base": "Le paramètre isEcoFriendly doit être un booléen.",
  }),
  maxPrice: Joi.number().integer().strict().positive().optional().messages({
    "number.integer": "Le prix maximum doit être un nombre entier.",
    "number.base": "Le prix maximum doit être un nombre entier.",
    "number.positive": "Le prix maximum doit être un nombre entier positif.",
  }),
  minRating: Joi.number().min(1).max(5).optional().messages({
    "number.min": "La note minimale doit être un nombre entre 1 et 5.",
    "number.max": "La note minimale doit être un nombre entre 1 et 5.",
  }),
  maxDuration: Joi.number().integer().strict().positive().optional().messages({
    "number.base": "La durée maximale doit être un nombre entier.",
    "number.integer": "La durée maximale doit être un nombre entier.",
    "number.positive": "La durée maximale doit être un nombre entier positif.",
  }),
});
