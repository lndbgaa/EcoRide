import Joi from "joi";

/**
 * Schéma de validation pour la déconnexion d'un compte
 */
export const logoutSchema = Joi.object({
  accountId: Joi.string().required().messages({
    "string.base": "L'identifiant du compte doit être une chaîne de caractères.",
    "string.empty": "L'identifiant du compte est requis.",
    "any.required": "L'identifiant du compte est requis.",
  }),
});

export default logoutSchema;
