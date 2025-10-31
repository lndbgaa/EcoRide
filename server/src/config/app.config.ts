import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { getEnvVar } from "@/utils";

import type { Config } from "@/types";
import type { StringValue } from "ms";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const nodeEnv = process.env.NODE_ENV ?? "development";
const envSpecificPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);

if (fs.existsSync(envSpecificPath)) {
  dotenv.config({ path: envSpecificPath });
}

const isProduction = nodeEnv === "production";
const serverUrl = isProduction ? getEnvVar("SERVER_URL") : "http://localhost:8080";
const clientUrl = isProduction ? getEnvVar("CLIENT_URL") : "http://localhost:3000";

const appConfig: Config = {
  env: nodeEnv,
  serverUrl,
  clientUrl,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,

  corsOptions: {
    origin: clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  },

  auth: {
    accessSecret: getEnvVar("AUTH_ACCESS_SECRET"),
    accessExpiration: (process.env.AUTH_ACCESS_EXPIRATION as StringValue) ?? "10m",
    refreshExpiration: (process.env.AUTH_REFRESH_EXPIRATION as StringValue) ?? "7d",
  },

  mysql: {
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    host: getEnvVar("MYSQL_HOST"),
    user: getEnvVar("MYSQL_USER"),
    password: getEnvVar("MYSQL_PASSWORD"),
    database: getEnvVar("MYSQL_NAME"),
  },

  mongodb: {
    uri: getEnvVar("MONGODB_URI"),
  },

  cloudinary: {
    cloudName: getEnvVar("CLOUDINARY_CLOUD_NAME"),
    apiKey: getEnvVar("CLOUDINARY_KEY"),
    apiSecret: getEnvVar("CLOUDINARY_SECRET"),
  },

  gmail: {
    user: getEnvVar("GMAIL_USER"),
    password: getEnvVar("GMAIL_PASSWORD"),
  },
};

export { appConfig };
