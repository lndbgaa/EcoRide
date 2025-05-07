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
const serverUrl = env === "production" ? getEnvVar("SERVER_URL") : "http://localhost:8080";
const clientUrl = env === "production" ? getEnvVar("CLIENT_URL") : "http://localhost:5173";

const config = {
  env,
  serverUrl,
  clientUrl,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  },
  jwt: {
    access_secret: getEnvVar("JWT_ACCESS_SECRET"),
    access_expiration: (process.env.JWT_ACCESS_EXPIRATION as StringValue) ?? "10m", // 10 minutes
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
  cloudinary: {
    cloud_name: getEnvVar("CLOUDINARY_CLOUD_NAME"),
    api_key: getEnvVar("CLOUDINARY_KEY"),
    api_secret: getEnvVar("CLOUDINARY_SECRET"),
  },
  nodemailer: {
    host: getEnvVar("SMTP_HOST"),
    port: parseInt(getEnvVar("SMTP_PORT")),
    user: getEnvVar("SMTP_USER"),
    pass: getEnvVar("SMTP_PASSWORD"),
  },
};

export default config;
