import type { StringValue } from "ms";

export interface Config {
  env: string;
  serverUrl: string;
  clientUrl: string;
  port: number;

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
  gmail: {
    user: string;
    password: string;
  };
}
