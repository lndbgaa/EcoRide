import { Sequelize } from "sequelize";

import { appConfig } from "@/config";
import { logger } from "@/utils";

const { env, mysql } = appConfig;
const { port, host, user, password, database } = mysql;

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "mysql",
  logging: env === "production" ? false : console.log,
});

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ MySQL: Connection successful");
  } catch (err) {
    throw new Error(`❌ Failed to connect to MySQL: ${(err as Error).message}`);
  }
};

export { connectMySQL, sequelize };
