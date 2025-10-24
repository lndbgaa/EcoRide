import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, label, printf, uncolorize, colorize, errors, json } = format;

const devFormat = printf(
  ({
    level,
    label,
    timestamp,
    message,
    debugMessage,
    code,
    stack,
    details,
    path,
    method,
    statusCode,
    statusText,
    userId,
    ...rest
  }) => {
    let log = `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;

    if (path && method) log += `\n- Route: [${method}] ${path}`;
    if (statusCode && statusText) log += `\n- Status: ${statusCode} (${statusText})`;
    if (userId) log += `\n- User: ${userId}`;

    if (debugMessage) log += `\n- Debug: ${debugMessage}`;
    if (code) log += `\n- Code: ${code}`;

    if (details && typeof details === "object" && Object.keys(details).length > 0) {
      log += `\n- Details: ${JSON.stringify(details)}`;
    }

    const extraFields = Object.keys(rest);
    if (extraFields.length > 0) {
      log += `\n- Extra: ${JSON.stringify(rest, null, 2)}`;
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

    log += `\n${"─".repeat(30)}`;
    return log;
  }
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    label({ label: "EcoRide API" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),

  exitOnError: false,
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(devFormat, colorize({ all: true })),
    })
  );
} else {
  logger.add(
    new transports.DailyRotateFile({
      dirname: "logs",
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      format: combine(json(), uncolorize()),
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
      auditFile: "logs/.audit-error.json",
    })
  );

  logger.add(
    new transports.DailyRotateFile({
      dirname: "logs",
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      format: combine(json(), uncolorize()),
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
      auditFile: "logs/.audit-combined.json",
    })
  );

  logger.add(
    new transports.Console({
      level: "error",
      format: combine(json(), uncolorize()),
    })
  );
}

export default logger;
