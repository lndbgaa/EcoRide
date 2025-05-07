function getEnvVar(name: string): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante: ${name}`);
  }

  return value;
}

const env = import.meta.env.NODE_ENV ?? "development";
const apiBaseUrl = env === "production" ? getEnvVar("API_BASE_URL") : "http://localhost:8080/api/v1";

const config = {
  env,
  apiBaseUrl,
};

export default config;
