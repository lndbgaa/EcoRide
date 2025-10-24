export interface Config {
  env: string;
  port: number;
  serverUrl: string;
  clientUrl: string;
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
}
