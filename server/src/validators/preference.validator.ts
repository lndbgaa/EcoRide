import Joi from "joi";

export const preferenceIdParamSchema = Joi.object({
  preferenceId: Joi.string().uuid().required().messages({
    "any.required": "L'id de la préférence est requis.",
    "string.base": "L'id de la préférence doit être une chaîne de caractères.",
    "string.empty": "L'id de la préférence est requis.",
    "string.guid": "L'id de la préférence doit être un identifiant valide.",
  }),
});

export const addPreferenceSchema = Joi.object({
  label: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le label est requis.",
    "string.base": "Le label doit être une chaîne de caractères non vide.",
    "string.empty": "Le label doit être une chaîne de caractères non vide.",
    "string.min": "Le label doit contenir au moins 2 caractères.",
    "string.max": "Le label doit contenir maximum 50 caractères.",
  }),
}).options({ stripUnknown: true });
