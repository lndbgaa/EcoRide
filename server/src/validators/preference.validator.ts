import Joi from "joi";

/**
 * Validation des données passées pour l'ajout d'une préférence personnalisée
 */
export const addPreferenceSchema = Joi.object({
  label: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le label de la préférence est requis.",
    "string.base":
      "Le label de la préférence doit être une chaîne de caractères non vide.",
    "string.empty":
      "Le label de la préférence doit être une chaîne de caractères non vide.",
    "string.min": "Le label de la préférence doit contenir au moins 2 caractères.",
    "string.max": "Le label de la préférence doit contenir maximum 50 caractères.",
  }),
});
