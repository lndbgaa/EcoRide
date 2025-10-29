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
    details,
    stack,
    ...rest
  }) => {
    let log = `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;

    if (path && method) log += `\n- Route: [${method}] ${path}`;
    if (userId) log += `\n- User: ${userId}`;
    if (statusCode && statusText) log += `\n- Status: ${statusCode} (${statusText})`;

    if (code) log += `\n- Code: ${code}`;
    if (debugCode) log += `\n- Debug code: ${debugCode}`;
    if (debugMessage) log += `\n- Debug message: ${debugMessage}`;

    const extraFields = Object.keys(rest);
    if (extraFields.length > 0) {
      log += `\n- Extra: ${JSON.stringify(rest, null, 2)}`;
    }

    if (details && Array.isArray(details) && details.length > 0) {
      const detailsString = details.map((d) => `   • ${d.field}: ${d.message}`).join("\n");
      log += `\n- Validation details:\n${detailsString}`;
    }

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
