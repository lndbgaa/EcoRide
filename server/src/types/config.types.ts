import type { CorsOptions } from "cors";
import type { StringValue } from "ms";

export type Env = "production" | "development" | "test";

export interface Config {
  env: Env;
  serverUrl: string;
  clientUrl: string;
  port: number;
  corsOptions: CorsOptions;
  auth: {
    refreshExpiration: StringValue;
    accessSecret: string;
    accessExpiration: StringValue;
  };
  mysql: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  mongodb: {
    uri: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  gmail: {
    user: string;
    password: string;
  };
}
