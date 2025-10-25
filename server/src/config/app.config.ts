import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { getEnvVar } from "@/utils";

import type { Config } from "@/types";
import type { StringValue } from "ms";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = process.env.NODE_ENV ?? "development";
const envPath = path.resolve(process.cwd(), `.env.${env}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const appConfig: Config = {
  env,
  serverUrl: env === "production" ? getEnvVar("SERVER_URL") : "http://localhost:8080",
  clientUrl: env === "production" ? getEnvVar("CLIENT_URL") : "http://localhost:3000",
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  auth: {
    accessSecret: getEnvVar("AUTH_ACCESS_SECRET"),
    accessExpiration: (process.env.AUTH_ACCESS_EXPIRATION as StringValue) ?? "10m",
    refreshExpiration: (process.env.AUTH_REFRESH_EXPIRATION as StringValue) ?? "7d",
  },
  mysql: {
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    host: getEnvVar("MYSQL_HOST"),
    user: getEnvVar("MYSQL_USER"),
    password: getEnvVar("MYSQL_PWD"),
    database: getEnvVar("MYSQL_NAME"),
  },
  mongodb: {
    uri: getEnvVar("MONGODB_URI"),
  },
  gmail: {
    user: getEnvVar("GMAIL_USER"),
    password: getEnvVar("GMAIL_PASSWORD"),
  },
};

export { appConfig };
