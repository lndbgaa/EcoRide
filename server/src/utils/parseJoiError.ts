import type { ValidationError } from "joi";

function parseJoiError(err: ValidationError) {
  return err.details.map((d) => {
    const field = d.path.join(".") || "root";

    return {
      field,
      messageKey: d.message,
      type: d.type,
      context: d.context,
    };
  });
}

export default parseJoiError;
