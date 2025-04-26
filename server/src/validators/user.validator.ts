import Joi from "joi";

/**
 * Validation des données passées pour la mise à jour des informations d'un utilisateur
 */
export const updateInfoSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional().messages({
    "string.base": "Le prénom doit être une chaîne de caractères non vide.",
    "string.empty": "Le prénom doit être une chaîne de caractères non vide.",
    "string.min": "Le prénom doit contenir au moins 2 caractères.",
    "string.max": "Le prénom doit contenir maximum 50 caractères.",
  }),
  lastName: Joi.string().trim().min(2).max(50).optional().messages({
    "string.base": "Le nom doit être une chaîne de caractères non vide.",
    "string.empty": "Le nom doit être une chaîne de caractères non vide.",
    "string.min": "Le nom doit contenir au moins 2 caractères.",
    "string.max": "Le nom doit contenir maximum 50 caractères.",
  }),
  pseudo: Joi.string().trim().min(3).max(20).optional().messages({
    "string.base": "Le pseudo doit être une chaîne de caractères non vide.",
    "string.empty": "Le pseudo doit être une chaîne de caractères non vide.",
    "string.min": "Le pseudo doit contenir au moins 3 caractères.",
    "string.max": "Le pseudo doit contenir maximum 20 caractères.",
  }),
  phone: Joi.string()
    .pattern(/^(0|\+33|0033)[1-9]\d{8}$/)
    .optional()
    .messages({
      "string.base": "Le numéro de téléphone doit être une chaîne de caractères non vide.",
      "string.empty": "Le numéro de téléphone doit être une chaîne de caractères non vide.",
      "string.pattern.base":
        "Le numéro de téléphone doit être un numéro de téléphone valide. Exemple: 06XXXXXXXX",
    }),
  address: Joi.string().trim().min(5).max(255).optional().messages({
    "string.base": "L'adresse doit être une chaîne de caractères.",
    "string.empty": "L'adresse doit être une chaîne de caractères non vide.",
    "string.min": "L'adresse doit contenir au moins 5 caractères.",
    "string.max": "L'adresse doit contenir maximum 255 caractères.",
  }),
  birthDate: Joi.date().optional().messages({
    "date.base": "La date de naissance doit être une date valide.",
    "date.empty": "La date de naissance doit être une date valide.",
  }),
})
  .options({ stripUnknown: true })
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être renseigné.",
  });

/**
 * Validation du rôle passé pour la mise à jour du rôle d'un utilisateur
 */
export const updateRoleSchema = Joi.object({
  role: Joi.string().trim().valid("driver", "passenger").required().messages({
    "any.required": "Le rôle à mettre à jour est requis.",
    "string.base": "Le rôle à mettre à jour doit être une chaîne de caractères non vide.",
    "string.empty": "Le rôle à mettre à jour doit être une chaîne de caractères non vide.",
    "any.only": "Le rôle à mettre à jour doit être soit 'driver' soit 'passenger'.",
  }),
}).options({ stripUnknown: true });
