import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = process.env.NODE_ENV ?? "development";
const envPath = path.resolve(process.cwd(), `.env.${env}`);
dotenv.config({ path: envPath });

import AppError from "@/utils/AppError.js";

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

const serverUrl = env === "production" ? getEnvVar("SERVER_URL") : "http://localhost:8080";
const clientUrl = env === "production" ? getEnvVar("CLIENT_URL") : "http://localhost:5173";

const allowedOriginsString = env === "production" ? getEnvVar("ALLOWED_ORIGINS") : "http://localhost:5173";
const allowedOrigins = allowedOriginsString.split(",").map((origin) => origin.trim());

const config = {
  env,
  clientUrl,
  serverUrl,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  },
  jwt: {
    accessSecret: getEnvVar("JWT_ACCESS_SECRET"),
    accessExpiration: (process.env.JWT_ACCESS_EXPIRATION as StringValue) ?? "10m", // 10 minutes
    refreshExpiration: (process.env.JWT_REFRESH_EXPIRATION as StringValue) ?? "7d", // 7 jours
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
    cloudName: getEnvVar("CLOUDINARY_CLOUD_NAME"),
    apiKey: getEnvVar("CLOUDINARY_KEY"),
    apiSecret: getEnvVar("CLOUDINARY_SECRET"),
  },
  nodemailer: {
    host: getEnvVar("SMTP_HOST"),
    port: parseInt(getEnvVar("SMTP_PORT")),
    user: getEnvVar("SMTP_USER"),
    pass: getEnvVar("SMTP_PASSWORD"),
  },
};

export default config;
