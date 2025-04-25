import Joi from "joi";

/**
 * Schéma de validation pour l'id d'un véhicule
 */
export const vehicleIdParamSchema = Joi.object({
  vehicleId: Joi.string().uuid().required().messages({
    "any.required": "L'id du véhicule est requis.",
    "string.base": "L'id du véhicule doit être une chaîne de caractères.",
    "string.empty": "L'id du véhicule est requis.",
    "string.guid": "L'id du véhicule doit être un UUID valide.",
  }),
});

/**
 * Validation des données passées pour l'ajout d'un véhicule par un utilisateur
 */
export const addVehicleSchema = Joi.object({
  brandId: Joi.number().strict().required().messages({
    "any.required": "L'id de la marque est requis.",
    "number.base": "L'id de la marque doit être un nombre.",
  }),
  model: Joi.string().trim().required().messages({
    "any.required": "Le modèle est requis.",
    "string.base": "Le modèle doit être une chaîne de caractères.",
    "string.empty": "Le modèle ne peut pas être vide.",
  }),
  colorId: Joi.number().strict().required().messages({
    "any.required": "L'id de la couleur est requis.",
    "number.base": "L'id de la couleur doit être un nombre.",
  }),
  energyId: Joi.number().strict().required().messages({
    "any.required": "L'id de l'énergie est requis.",
    "number.base": "L'id de l'énergie doit être un nombre.",
  }),
  seats: Joi.number().strict().min(2).max(7).required().messages({
    "any.required": "Le nombre de sièges est requis.",
    "number.base": "Le nombre de sièges doit être un nombre.",
    "number.min": "Le nombre de sièges doit être supérieur ou égal à 2.",
    "number.max": "Le nombre de sièges doit être inférieur ou égal à 7.",
  }),
  licensePlate: Joi.string()
    .trim()
    .required()
    .pattern(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/i)
    .messages({
      "any.required": "La plaque d'immatriculation est requise.",
      "string.base": "La plaque d'immatriculation doit être une chaîne de caractères.",
      "string.empty": "La plaque d'immatriculation ne peut pas être vide.",
      "string.pattern.base": "Format de plaque invalide. Format attendu : AB-123-CD",
    }),
  firstRegistration: Joi.date().required().messages({
    "any.required": "La date de première mise en circulation est requise.",
    "date.base": "La date de première mise en circulation doit être une date valide.",
  }),
})

  .unknown(false)
  .messages({
    "object.unknown":
      "Seuls les champs 'brandId', 'model', 'colorId', 'energyId', 'seats', 'licensePlate', 'firstRegistration' sont autorisés.",
  });

/**
 * Validation des données passées pour la mise à jour d'un véhicule par un utilisateur
 */
export const updateVehicleSchema = Joi.object({
  brandId: Joi.number().strict().optional().messages({
    "number.base": "L'id de la marque doit être un nombre.",
  }),
  model: Joi.string().trim().optional().messages({
    "string.base": "Le modèle doit être une chaîne de caractères.",
    "string.empty": "Le modèle ne peut pas être vide.",
  }),
  colorId: Joi.number().strict().optional().messages({
    "number.base": "L'id de la couleur doit être un nombre.",
  }),
  energyId: Joi.number().strict().optional().messages({
    "number.base": "L'id de l'énergie doit être un nombre.",
  }),
  seats: Joi.number().strict().min(2).max(7).optional().messages({
    "number.base": "Le nombre de sièges doit être un nombre.",
    "number.min": "Le nombre de sièges doit être supérieur ou égal à 2.",
    "number.max": "Le nombre de sièges doit être inférieur ou égal à 7.",
  }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "Au moins un champ doit être renseigné.",
    "object.unknown":
      "Seuls les champs 'brandId', 'model', 'colorId', 'energyId', 'seats' sont autorisés.",
  });
