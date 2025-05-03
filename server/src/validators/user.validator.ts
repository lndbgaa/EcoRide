import dayjs from "dayjs";
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
  pseudo: Joi.string()
    .trim()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_-]{3,20}$/)
    .optional()
    .messages({
      "string.base": "Le pseudo doit être une chaîne de caractères non vide.",
      "string.empty": "Le pseudo doit être une chaîne de caractères non vide.",
      "string.min": "Le pseudo doit contenir au moins 3 caractères.",
      "string.max": "Le pseudo doit contenir maximum 20 caractères.",
      "string.pattern.base":
        "Le pseudo ne doit contenir que des lettres, des chiffres, des tirets et des underscores.",
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|\+33|0033)[1-9]\d{8}$/)
    .optional()
    .messages({
      "string.base":
        "Le numéro de téléphone doit être une chaîne de caractères non vide.",
      "string.empty":
        "Le numéro de téléphone doit être une chaîne de caractères non vide.",
      "string.pattern.base":
        "Le numéro de téléphone doit être un numéro de téléphone valide. Exemple: 06XXXXXXXX",
    }),
  address: Joi.string().trim().min(5).max(255).optional().messages({
    "string.base": "L'adresse doit être une chaîne de caractères.",
    "string.empty": "L'adresse doit être une chaîne de caractères non vide.",
    "string.min": "L'adresse doit contenir au moins 5 caractères.",
    "string.max": "L'adresse doit contenir maximum 255 caractères.",
  }),
  birthDate: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const now = dayjs();
      const parsed = dayjs(value, "DD/MM/YYYY", true);

      if (!parsed.isValid() || !parsed.isBefore(now)) {
        return helpers.error("any.invalid");
      }

      const age = now.diff(parsed, "year");

      if (age < 18) {
        return helpers.error("date.minAge");
      }

      return value;
    })
    .optional()
    .messages({
      "string.base": "La date de naissance doit être une date valide.",
      "string.empty": "La date de naissance doit être une date valide.",
      "any.invalid": "La date de naissance doit être une date valide.",
      "date.minAge": "Vous devez avoir au moins 18 ans.",
    }),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ valide doit être renseigné.",
  });

/**
 * Validation du rôle passé pour la mise à jour du rôle d'un utilisateur
 */
export const updateRoleSchema = Joi.object({
  role: Joi.string().trim().valid("driver", "passenger").required().messages({
    "any.required": "Le rôle à mettre à jour est requis.",
    "string.base": "Le rôle à mettre à jour doit être une chaîne de caractères non vide.",
    "string.empty":
      "Le rôle à mettre à jour doit être une chaîne de caractères non vide.",
    "any.only": "Le rôle à mettre à jour doit être soit 'driver' soit 'passenger'.",
  }),
});
