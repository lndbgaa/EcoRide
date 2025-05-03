import dayjs from "dayjs";
import Joi from "joi";

/**
 * Validation des données passées pour l'ajout d'un véhicule par un utilisateur
 */
export const addVehicleSchema = Joi.object({
  brandId: Joi.number().integer().min(1).strict().required().messages({
    "any.required": "L'id de la marque est requis.",
    "number.base": "L'id de la marque doit être un nombre.",
    "number.min": "L'id de la marque doit être supérieur à 0.",
  }),
  model: Joi.string().trim().min(2).max(50).required().messages({
    "any.required": "Le modèle est requis.",
    "string.base": "Le modèle doit être une chaîne de caractères non vide.",
    "string.empty": "Le modèle doit être une chaîne de caractères non vide.",
    "string.min": "Le modèle doit contenir au moins 2 caractères.",
    "string.max": "Le modèle doit contenir maximum 50 caractères.",
  }),
  colorId: Joi.number().integer().min(1).strict().required().messages({
    "any.required": "L'id de la couleur est requis.",
    "number.base": "L'id de la couleur doit être un nombre entier.",
    "number.min": "L'id de la couleur doit être supérieur à 0.",
  }),
  energyId: Joi.number().integer().min(1).strict().required().messages({
    "any.required": "L'id de l'énergie est requis.",
    "number.base": "L'id de l'énergie doit être un nombre entier.",
    "number.min": "L'id de l'énergie doit être supérieur à 0.",
  }),
  seats: Joi.number().integer().strict().min(2).max(7).required().messages({
    "any.required": "Le nombre de sièges est requis.",
    "number.base": "Le nombre de sièges doit être un nombre entier.",
    "number.min": "Le nombre de sièges pour une voiture doit être minimum de 2.",
    "number.max": "Le nombre de sièges pour une voiture doit être maximum de 7.",
  }),
  licensePlate: Joi.string()
    .trim()
    .required()
    .pattern(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/i)
    .messages({
      "any.required": "La plaque d'immatriculation est requise.",
      "string.base":
        "La plaque d'immatriculation doit être une chaîne de caractères non vide.",
      "string.empty":
        "La plaque d'immatriculation doit être une chaîne de caractères non vide.",
      "string.pattern.base": "Format de plaque invalide. Format attendu : AB-123-CD",
    }),
  firstRegistration: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const today = dayjs();
      const parsed = dayjs(value, "DD/MM/YYYY", true);
      if (!parsed.isValid() || !parsed.isBefore(today)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "La date de première mise en circulation est requise.",
      "string.base": "La date de première mise en circulation doit être une date valide.",
      "string.empty":
        "La date de première mise en circulation doit être une date valide.",
      "any.invalid":
        "La date de première mise en circulation doit être une date valide antérieure à la date actuelle.",
    }),
});

/**
 * Validation des données passées pour la mise à jour d'un véhicule par un utilisateur
 */
export const updateVehicleSchema = Joi.object({
  brandId: Joi.number().integer().min(1).strict().optional().messages({
    "number.base": "L'id de la marque doit être un nombre entier.",
    "number.min": "L'id de la marque doit être supérieur à 0.",
  }),
  model: Joi.string().trim().min(2).max(50).optional().messages({
    "string.base": "Le modèle doit être une chaîne de caractères.",
    "string.empty": "Le modèle doit être une chaîne de caractères non vide.",
    "string.min": "Le modèle doit contenir au moins 2 caractères.",
    "string.max": "Le modèle doit contenir maximum 50 caractères.",
  }),
  colorId: Joi.number().integer().min(1).strict().optional().messages({
    "number.base": "L'id de la couleur doit être un nombre entier.",
    "number.min": "L'id de la couleur doit être supérieur à 0.",
  }),
  energyId: Joi.number().integer().min(1).strict().optional().messages({
    "number.base": "L'id de l'énergie doit être un nombre entier.",
    "number.min": "L'id de l'énergie doit être supérieur à 0.",
  }),
  seats: Joi.number().integer().min(2).max(7).optional().messages({
    "number.base": "Le nombre de sièges doit être un nombre entier.",
    "number.min": "Le nombre de sièges pour une voiture doit être minimum de 2.",
    "number.max": "Le nombre de sièges pour une voiture doit être maximum de 7.",
  }),
})
  .min(1)
  .messages({
    "object.min": "Au moins une propriété valide doit être renseignée.",
  });
