import logger from "@/utils/logger.js";

export function getEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    logger.error(`❌ Missing environment variable: ${name}`);
    process.exit(1);
  }

  return value;
}
