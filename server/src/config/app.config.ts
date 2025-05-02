import dotenv from "dotenv";
dotenv.config();

import AppError from "@/utils/AppError";

import type { StringValue } from "ms";

function getEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new AppError({
      statusCode: 500,
      statusText: "Internal Server Error",
      message: `❌ Variable d'environnement manquante: ${name}`,
    });
  }
  return value;
}

const env = process.env.NODE_ENV ?? "development";

const config = {
  env,
  port: process.env.MYSQL_DB_PORT ? Number(process.env.MYSQL_DB_PORT) : 8080,
  url: env === "production" ? getEnvVar("SERVER_URL") : "http://localhost:8080",
  cors: {
    origin: env === "production" ? getEnvVar("CLIENT_URL") : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  },
  jwt: {
    access_secret: getEnvVar("JWT_ACCESS_SECRET"),
    access_expiration: (process.env.JWT_ACCESS_EXPIRATION as StringValue) ?? "15m", // 15 minutes
    refresh_expiration: (process.env.JWT_REFRESH_EXPIRATION as StringValue) ?? "7d", // 7 jours
  },
  mysql: {
    port: process.env.MYSQL_DB_PORT ? Number(process.env.MYSQL_DB_PORT) : 3306,
    host: getEnvVar("MYSQL_DB_HOST"),
    user: getEnvVar("MYSQL_DB_USER"),
    password: getEnvVar("MYSQL_DB_PWD"),
    database: getEnvVar("MYSQL_DB_NAME"),
  },
  mongo: {
    uri: getEnvVar("MONGO_DB_URI"),
  },
};

export { getEnvVar };
export default config;
