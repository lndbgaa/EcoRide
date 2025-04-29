import Joi from "joi";

const createReviewSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'id du trajet à évaluer est requis.",
    "string.base":
      "L'id du trajet à évaluer doit être une chaîne de caractères.",
    "string.empty":
      "L'id du trajet à évaluer doit être une chaîne de caractères non vide.",
    "string.guid": "L'id du trajet à évaluer doit être un identifiant valide.",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": "Une note est requise pour évaluer le trajet.",
    "number.base": "La note doit être un nombre.",
    "number.integer": "La note doit être un nombre entier.",
    "number.min": "La note doit être au minimum de 1.",
    "number.max": "La note doit être au maximum de 5.",
  }),
  comment: Joi.string().trim().min(10).max(255).required().messages({
    "any.required": "Un commentaire est requis pour évaluer le trajet.",
    "string.empty":
      "Le commentaire doit être une chaîne de caractères non vide.",
    "string.min": "Le commentaire doit contenir au moins 10 caractères.",
    "string.max": "Le commentaire ne peut pas contenir plus de 255 caractères.",
  }),
}).options({ stripUnknown: true });

export default createReviewSchema;
