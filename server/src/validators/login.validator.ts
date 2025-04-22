import Joi from "joi";

/**
 * Schéma de validation pour la connexion d'un utilisateur
 */
export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": "L'email est requis.",
    "string.empty": "L'email est requis.",
    "string.base": "L'email doit être une chaîne de caractères.",
    "string.email": "L'email doit être valide.",
  }),
  password: Joi.string().trim().required().messages({
    "any.required": "Le mot de passe est requis.",
    "string.empty": "Le mot de passe est requis.",
    "string.base": "Le mot de passe doit être une chaîne de caractères.",
  }),
});

export default loginSchema;
