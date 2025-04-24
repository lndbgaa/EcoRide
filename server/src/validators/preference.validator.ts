import Joi from "joi";

export const preferenceIdParamSchema = Joi.object({
  preferenceId: Joi.string().uuid().required().messages({
    "any.required": "L'id de la préférence est requis.",
    "string.base": "L'id de la préférence doit être une chaîne de caractères.",
    "string.empty": "L'id de la préférence est requis.",
    "string.guid": "L'id de la préférence doit être un UUID valide.",
  }),
});

export const addPreferenceSchema = Joi.object({
  label: Joi.string().trim().required().messages({
    "any.required": "Le label est requis.",
    "string.base": "Le label doit être une chaîne de caractères.",
    "string.empty": "Le label ne peut pas être vide.",
  }),
});
