import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { getEnvVar } from "@/utils/env.utils.js";

import type { Config } from "@/types/config.types.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = process.env.NODE_ENV ?? "development";
const envPath = path.resolve(process.cwd(), `.env.${env}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const config: Config = {
  env,
  serverUrl: env === "production" ? getEnvVar("SERVER_URL") : "http://localhost:8080",
  clientUrl: env === "production" ? getEnvVar("CLIENT_URL") : "http://localhost:3000",
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
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
};

export default config;
