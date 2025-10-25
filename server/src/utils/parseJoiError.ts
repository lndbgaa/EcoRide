import type { ParsedJoiErrorItem } from "@/types";
import type { ValidationError } from "joi";

function parseJoiError(err: ValidationError): ParsedJoiErrorItem[] {
  return err.details.map((d) => {
    const [index, field] = d.path;

    return {
      index: typeof index === "number" ? index : undefined,
      field: typeof index === "number" ? String(field ?? "root") : String(index ?? "root"),
      message: d.message,
    };
  });
}

export default parseJoiError;
