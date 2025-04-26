import Joi from "joi";

/**
 * Schéma de validation pour l'id d'une réservation
 */
export const bookingIdParamSchema = Joi.object({
  bookingId: Joi.string().uuid().required().messages({
    "any.required": "L'id de la réservation est requis.",
    "string.base": "L'id de la réservation doit être une chaîne de caractères.",
    "string.empty": "L'id de la réservation est requis.",
    "string.guid": "L'id de la réservation doit être un UUID valide.",
  }),
});

export const createBookingSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet est requis.",
    "string.uuid": "L'id du trajet doit être un identifiant valide.",
  }),
  seats: Joi.number().integer().min(1).max(1).required().messages({
    "any.required": "Le nombre de places réservées est requis.",
    "number.integer": "Le nombre de places réservées doit être un nombre entier.",
    "number.min": "Le nombre de places réservées doit être supérieur à 0.",
    "number.max": "Le nombre de places réservées ne peut pas dépasser 1.",
  }),
});
