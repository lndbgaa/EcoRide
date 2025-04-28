import Joi from "joi";

/**
 * Schéma de validation pour l'id d'une réservation
 */
export const bookingIdParamSchema = Joi.object({
  bookingId: Joi.string().uuid().required().messages({
    "any.required": "L'id de la réservation est requis.",
    "string.base": "L'id de la réservation doit être une chaîne de caractères.",
    "string.empty": "L'id de la réservation est requis.",
    "string.guid": "L'id de la réservation doit être un identifiant valide.",
  }),
});

export const createBookingSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet à réserver est requis.",
    "string.uuid": "L'id du trajet à réserver doit être un identifiant valide.",
  }),
  seats: Joi.number().integer().min(1).required().messages({
    "any.required": "Le nombre de places à réserver est requis.",
    "number.integer": "Le nombre de places à réserver doit être un nombre entier.",
    "number.min": "Le nombre de places à réserver doit être supérieur à 0.",
    "number.max": "Le nombre de places à réserver ne peut pas dépasser 1.",
  }),
}).options({ stripUnknown: true });
