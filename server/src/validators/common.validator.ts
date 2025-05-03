import Joi from "joi";

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "any.required": "L'id de l'élément est requis.",
    "string.base": "L'id de l'élément doit être une chaîne de caractères.",
    "string.empty": "L'id de l'élément doit être une chaîne de caractères non vide.",
    "string.guid": "L'id de l'élément doit être un identifiant valide.",
  }),
});
