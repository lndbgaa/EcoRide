import Joi from "joi";

export const createIncidentSchema = Joi.object({
  rideId: Joi.string().uuid().required().messages({
    "any.required": "L'identifiant du trajet est requis.",
    "string.base":
      "L'identifiant du trajet doit être une chaîne de caractères.",
    "string.empty":
      "L'identifiant du trajet doit être une chaîne de caractères non vide.",
    "string.guid": "L'identifiant du trajet doit être un identifiant valide.",
  }),
  description: Joi.string().trim().min(10).max(255).required().messages({
    "any.required": "La description de l'incident est requise.",
    "string.empty":
      "La description de l'incident doit être une chaîne de caractères non vide.",
    "string.min":
      "La description de l'incident doit contenir au moins 10 caractères.",
    "string.max":
      "La description de l'incident ne peut pas contenir plus de 255 caractères.",
  }),
}).options({ stripUnknown: true });

export const IncidentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "assigned", "resolved")
    .required()
    .messages({
      "any.required": "Le statut des incidents est requis.",
      "string.valid":
        "Le statut des incidents doit être 'pending', 'assigned' ou 'resolved'.",
    }),
}).options({ stripUnknown: true });

export const resolveIncidentSchema = Joi.object({
  note: Joi.string().trim().min(10).max(255).required().messages({
    "any.required": "La note de résolution est requise.",
    "string.empty":
      "La note de résolution doit être une chaîne de caractères non vide.",
    "string.min": "La note de résolution doit contenir au moins 10 caractères.",
    "string.max":
      "La note de résolution ne peut pas contenir plus de 255 caractères.",
  }),
}).options({ stripUnknown: true });
