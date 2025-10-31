import type { ValidationError } from "joi";

function parseJoiError(err: ValidationError) {
  return err.details.map((d) => {
    const [index, field] = d.path;

    return {
      index: typeof index === "number" ? index : undefined,
      field: typeof index === "number" ? String(field ?? "root") : String(index ?? "root"),
      messageKey: d.message,
      type: d.type,
    };
  });
}

export default parseJoiError;
