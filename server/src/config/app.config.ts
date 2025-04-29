import dotenv from "dotenv";
dotenv.config();

import type { StringValue } from "ms";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante: ${name}`);
  }
  return value;
}

const config = {
  server: {
    env: process.env.NODE_ENV ?? "development",
    port: process.env.MYSQL_DB_PORT ? Number(process.env.MYSQL_DB_PORT) : 8080,
    url: process.env.SERVER_URL ?? "http://localhost:8080",
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

export default config;
export { getEnvVar };
