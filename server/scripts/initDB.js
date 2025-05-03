import path from "path";
import { fileURLToPath } from "url";
import runSQLFile from "./runSQLFile.js";

// Reconstitue les équivalents de __filename et __dirname en ESM
const __filename = fileURLToPath(import.meta.url); // Chemin complet du fichier actuel
const __dirname = path.dirname(__filename); // Dossier contenant ce fichier

const initDB = async () => {
  const files = [
    path.resolve(__dirname, "./sql/init_schema.sql"),
    path.resolve(__dirname, "./sql/init_seeds.sql"),
  ];

  for (const file of files) {
    await runSQLFile(file);
  }

  console.log("✅ Base de données initialisée !");
};

initDB().catch((err) => {
  console.error("❌ Échec de l'initialisation ! \n", err.message);
});
