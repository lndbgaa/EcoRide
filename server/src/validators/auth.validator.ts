import Joi from "joi";

/**
 * Schéma de validation pour la connexion à un compte.
 */
export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": "L'email est requis.",
    "string.empty": "L'email doit être une chaîne de caractères non vide.",
    "string.base": "L'email doit être une chaîne de caractères non vide.",
    "string.email": "L'email doit respecter le format d'un email valide.",
  }),
  password: Joi.string().trim().required().messages({
    "any.required": "Le mot de passe est requis.",
    "string.empty":
      "Le mot de passe doit être une chaîne de caractères non vide.",
    "string.base":
      "Le mot de passe doit être une chaîne de caractères non vide.",
  }),
}).options({ stripUnknown: true });

/**
 * Schéma de validation pour la création d'un compte utilisateur.
 */
export const registerUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(100).required().messages({
    "any.required": "Un email est requis.",
    "string.base": "L'email  doit être une chaîne de caractères non vide.",
    "string.empty": "L'email doit être une chaîne de caractères non vide.",
    "string.email": "L'email doit être valide.",
    "string.max": "L'email ne doit pas dépasser 100 caractères.",
  }),
  pseudo: Joi.string()
    .trim()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_-]{3,20}$/)
    .required()
    .messages({
      "any.required": "Un pseudo est requis.",
      "string.base": "Le pseudo doit être une chaîne de caractères non vide.",
      "string.empty": "Le pseudo doit être une chaîne de caractères non vide.",
      "string.min": "Le pseudo doit contenir au moins 3 caractères.",
      "string.max": "Le pseudo doit contenir maximum 20 caractères.",
      "string.pattern.base":
        "Le pseudo ne doit contenir que des lettres, des chiffres, des tirets et des underscores.",
    }),
  password: Joi.string()
    .trim()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])\S+$/)
    .required()
    .messages({
      "any.required": "Un mot de passe est requis.",
      "string.base":
        "Le mot de passe doit être une chaîne de caractères non vide.",
      "string.empty":
        "Le mot de passe doit être une chaîne de caractères non vide.",
      "string.min": "Le mot de passe doit contenir au moins 8 caractères.",
      "string.max": "Le mot de passe doit contenir maximum 16 caractères.",
      "string.pattern.base":
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et aucun espace.",
    }),
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le prénom est requis.",
    "string.base": "Le prénom doit être une chaîne de caractères non vide.",
    "string.empty": "Le prénom doit être une chaîne de caractères non vide.",
    "string.min": "Le prénom doit contenir au moins 2 caractères.",
    "string.max": "Le prénom doit contenir maximum 50 caractères.",
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le nom est requis.",
    "string.base": "Le nom doit être une chaîne de caractères non vide.",
    "string.empty": "Le nom doit être une chaîne de caractères non vide.",
    "string.min": "Le nom doit contenir au moins 2 caractères.",
    "string.max": "Le nom doit contenir maximum 50 caractères.",
  }),
}).options({ stripUnknown: true });

/**
 * Schéma de validation pour la création d'un compte employé.
 */
export const registerEmployeeSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(100).required().messages({
    "any.required": "Un email est requis.",
    "string.base": "L'email doit être une chaîne de caractères non vide.",
    "string.empty": "L'email doit être une chaîne de caractères non vide.",
    "string.email": "L'email doit être valide.",
    "string.max": "L'email ne doit pas dépasser 100 caractères.",
  }),
  password: Joi.string()
    .trim()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])\S+$/)
    .required()
    .messages({
      "any.required": "Un mot de passe est requis.",
      "string.empty":
        "Le mot de passe doit être une chaîne de caractères non vide.",
      "string.base":
        "Le mot de passe doit être une chaîne de caractères non vide.",
      "string.min": "Le mot de passe doit contenir au moins 8 caractères.",
      "string.max": "Le mot de passe doit contenir maximum 16 caractères.",
      "string.pattern.base":
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et aucun espace.",
    }),
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le prénom est requis.",
    "string.base": "Le prénom doit être une chaîne de caractères non vide.",
    "string.empty": "Le prénom doit être une chaîne de caractères non vide.",
    "string.min": "Le prénom doit contenir au moins 2 caractères.",
    "string.max": "Le prénom doit contenir maximum 50 caractères.",
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le nom est requis.",
    "string.base": "Le nom doit être une chaîne de caractères non vide.",
    "string.empty": "Le nom doit être une chaîne de caractères non vide.",
    "string.min": "Le nom doit contenir au moins 2 caractères.",
    "string.max": "Le nom doit contenir maximum 50 caractères.",
  }),
}).options({ stripUnknown: true });
