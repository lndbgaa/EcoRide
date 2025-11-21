import Joi from "joi";

import { VALIDATION_MESSAGES } from "@/constants";

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "any.required": VALIDATION_MESSAGES.REQUIRED,
    "string.base": VALIDATION_MESSAGES.STRING_BASE,
    "string.empty": VALIDATION_MESSAGES.STRING_EMPTY,
    "string.guid": VALIDATION_MESSAGES.STRING_UUID,
  }),
});
