import { Sequelize } from "sequelize";

import config from "@/config/app.config.js";

const { port, host, user, password, database } = config.mysql;

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "mysql",
});

const connectMySQL = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL: Connexion réussie");
  } catch (err) {
    throw new Error(`❌ Échec de connexion à MySQL: ${(err as Error).message}`);
  }
};

export { connectMySQL, sequelize };
