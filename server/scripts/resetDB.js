import path from "path";
import { fileURLToPath } from "url";
import runSQLFile from "./runSQLFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resetDB = async () => {
  const files = [
    path.resolve(__dirname, "./sql/drop_schema.sql"),
    path.resolve(__dirname, "./sql/init_schema.sql"),
    path.resolve(__dirname, "./sql/init_seeds.sql"),
  ];

  for (const file of files) {
    await runSQLFile(file);
  }

  console.log("✅ Base de données réinitialisée !");
};

resetDB().catch((err) => {
  console.error("❌ Échec de la réinitialisation ! \n", err.message);
});
