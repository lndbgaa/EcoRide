import Joi from "joi";

/**
 * Validation des données passées pour la création d'un incident
 */
export const createIncidentSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'identifiant du trajet est requis.",
    "string.base": "L'identifiant du trajet doit être une chaîne de caractères.",
    "string.empty":
      "L'identifiant du trajet doit être une chaîne de caractères non vide.",
    "string.guid": "L'identifiant du trajet doit être un identifiant valide.",
  }),
  description: Joi.string().trim().min(10).max(255).required().messages({
    "any.required": "La description de l'incident est requise.",
    "string.base": "La description de l'incident doit être une chaîne de caractères.",
    "string.empty":
      "La description de l'incident doit être une chaîne de caractères non vide.",
    "string.min": "La description de l'incident doit contenir au moins 10 caractères.",
    "string.max": "La description de l'incident doit contenir au maximum 255 caractères.",
  }),
});

/**
 * Validation des données passées pour la résolution d'un incident
 */
export const resolveIncidentSchema = Joi.object({
  note: Joi.string().trim().min(10).max(255).required().messages({
    "any.required": "La note de résolution est requise.",
    "string.base": "La note de résolution doit être une chaîne de caractères.",
    "string.empty": "La note de résolution doit être une chaîne de caractères non vide.",
    "string.min": "La note de résolution doit contenir au moins 10 caractères.",
    "string.max": "La note de résolution doit contenir au maximum 255 caractères.",
  }),
});
