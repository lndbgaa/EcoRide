import Joi from "joi";

export const createBookingSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet à réserver est requis.",
    "string.empty":
      "L'id du trajet doit être une chaîne de caractères non vide.",
    "string.uuid": "L'id du trajet à réserver doit être un identifiant valide.",
  }),
  seats: Joi.number().integer().min(1).max(1).required().messages({
    "any.required": "Le nombre de places à réserver est requis.",
    "number.integer":
      "Le nombre de places à réserver doit être un nombre entier.",
    "number.min": "Le nombre de places à réserver doit être supérieur à 0.",
    "number.max": "Le nombre de places à réserver ne peut pas dépasser 1.",
  }),
}).options({ stripUnknown: true });

export const confirmBookingWithIncidentSchema = Joi.object({
  description: Joi.string().min(10).max(255).required().messages({
    "any.required": "La description de l'incident est requise.",
    "string.empty":
      "La description de l'incident doit être une chaîne de caractères non vide.",
    "string.min":
      "La description de l'incident doit contenir au moins 10 caractères.",
    "string.max":
      "La description de l'incident doit contenir au plus 255 caractères.",
  }),
}).options({ stripUnknown: true });
