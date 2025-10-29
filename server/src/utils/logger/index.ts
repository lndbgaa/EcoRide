import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

import { devFormat } from "./formats";

const { combine, timestamp, label, uncolorize, colorize, errors, json } = format;

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
