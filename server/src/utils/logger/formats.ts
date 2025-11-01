import { format } from "winston";

const { printf } = format;

export const devFormat = printf(
  ({
    level,
    label,
    timestamp,
    message,
    path,
    method,
    userId,
    statusCode,
    statusText,
    code,
    debugCode,
    debugMessage,
    errors,
    error,
    stack,
    ...rest
  }) => {
    let log = `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;

    // Route & user info
    if (path && method) log += `\n- Route: [${method}] ${path}`;
    if (userId) log += `\n- User: ${userId}`;
    if (statusCode && statusText) log += `\n- HTTP: ${statusCode} ${statusText}`;

    // Codes & debug info
    if (code) log += `\n- Code: ${code}`;
    if (debugCode) log += `\n- Debug code: ${debugCode}`;
    if (debugMessage) log += `\n- Debug message: ${debugMessage}`;

    // Validation errors
    if (errors && Array.isArray(errors) && errors.length > 0) {
      const detailsString = errors.map((e) => `   • ${e.field}: ${e.message}`).join("\n");
      log += `\n- Validation errors:\n${detailsString}`;
    }

    // Generic error (non-AppError)
    if (error) log += `\n- Error: ${typeof error === "string" ? error : JSON.stringify(error, null, 2)}`;

    // Extra fields (any remaining keys not explicitly handled above)
    const extraFields = Object.keys(rest);
    if (extraFields.length > 0) {
      log += `\n- Extra: ${JSON.stringify(rest, null, 2)}`;
    }

    // Stack trace
    if (stack) {
      const formattedStack = String(stack)
        .split("\n")
        .slice(1)
        .filter((line) => !line.includes("node_modules"))
        .map((line) => `      ${line.trim()}`)
        .join("\n");

      log += `\n- Stack trace:\n${formattedStack}`;
    }

    log += `\n${"─".repeat(50)}`;
    return log;
  }
);
