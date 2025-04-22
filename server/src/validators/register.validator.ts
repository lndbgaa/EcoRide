import Joi from "joi";

/**
 * Schéma de validation pour la création d'un compte (inscription).
 */
export const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(100).required().messages({
    "any.required": "L'email est requis.",
    "string.base": "L'email doit être une chaîne de caractères.",
    "string.empty": "L'email est requis.",
    "string.email": "L'email doit être valide.",
    "string.max": "L'email ne doit pas dépasser 100 caractères.",
  }),
  pseudo: Joi.string().trim().min(3).max(20).pattern(/^\S+$/).required().messages({
    "any.required": "Le pseudo est requis.",
    "string.base": "Le pseudo doit être une chaîne de caractères.",
    "string.empty": "Le pseudo est requis.",
    "string.min": "Le pseudo doit contenir au moins 3 caractères.",
    "string.max": "Le pseudo ne doit pas dépasser 20 caractères.",
    "string.pattern.base": "Le pseudo ne doit pas contenir d'espaces.",
  }),
  password: Joi.string()
    .trim()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])\S+$/)
    .required()
    .messages({
      "any.required": "Le mot de passe est requis.",
      "string.base": "Le mot de passe doit être une chaîne de caractères.",
      "string.empty": "Le mot de passe est requis.",
      "string.min": "Le mot de passe doit contenir au moins 8 caractères.",
      "string.max": "Le mot de passe doit contenir maximum 16 caractères.",
      "string.pattern.base":
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et aucun espace.",
    }),
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le prénom est requis.",
    "string.base": "Le prénom doit être une chaîne de caractères.",
    "string.empty": "Le prénom est requis.",
    "string.min": "Le prénom doit contenir au moins 2 caractères.",
    "string.max": "Le prénom ne doit pas dépasser 50 caractères.",
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le nom est requis.",
    "string.base": "Le nom doit être une chaîne de caractères.",
    "string.empty": "Le nom est requis.",
    "string.min": "Le nom doit contenir au moins 2 caractères.",
    "string.max": "Le nom ne doit pas dépasser 50 caractères.",
  }),
});

export default registerSchema;
