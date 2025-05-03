import Joi from "joi";

/**
 * Validation des données passées pour la création d'une évaluation
 */
export const createReviewSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet à évaluer est requis.",
    "string.base": "L'id du trajet à évaluer doit être une chaîne de caractères.",
    "string.empty":
      "L'id du trajet à évaluer doit être une chaîne de caractères non vide.",
    "string.guid": "L'id du trajet à évaluer doit être un identifiant valide.",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": "Une note est requise.",
    "number.base": "La note doit être un nombre.",
    "number.integer": "La note doit être un nombre entier.",
    "number.min": "La note doit être un nombre entier compris entre 1 et 5.",
    "number.max": "La note doit être un nombre entier compris entre 1 et 5.",
  }),
  comment: Joi.string().trim().min(10).max(255).required().messages({
    "any.required": "Un commentaire est requis.",
    "string.base": "Le commentaire doit être une chaîne de caractères.",
    "string.empty": "Le commentaire doit être une chaîne de caractères non vide.",
    "string.min": "Le commentaire doit contenir au moins 10 caractères.",
    "string.max": "Le commentaire doit contenir au maximum 255 caractères.",
  }),
});
