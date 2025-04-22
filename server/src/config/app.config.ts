import dotenv from "dotenv";
dotenv.config();

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
    port: process.env.PORT ?? 8080,
    url: process.env.SERVER_URL ?? "http://localhost:8080",
    jwt_secret: getEnvVar("JWT_SECRET"),
    jwt_refresh_secret: getEnvVar("JWT_REFRESH_SECRET"),
  },
  mysql: {
    port: Number(process.env.MYSQL_DB_PORT) || 3306,
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
