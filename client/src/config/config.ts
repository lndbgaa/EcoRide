function getEnvVar(name: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[name];

  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante: ${name}`);
  }

  return value;
}

const env = import.meta.env.VITE_NODE_ENV ?? "development";
const apiBaseUrl = env === "production" ? getEnvVar("VITE_API_BASE_URL") : "http://localhost:8080/api/v1";

const config = {
  env,
  apiBaseUrl,
};

export default config;
