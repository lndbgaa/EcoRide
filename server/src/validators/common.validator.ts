import Joi from "joi";

/**
 * Schéma de validation pour l'id d'un compte
 */
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "any.required": "L'id du compte est requis.",
    "string.base": "L'id du compte doit être une chaîne de caractères.",
    "string.empty": "L'id du compte est requis.",
    "string.guid": "L'id du compte doit être un UUID valide.",
  }),
});
