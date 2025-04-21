import config from "@/config/app.config.js";
import fs from "fs";
import mysql from "mysql2/promise";

const { host, user, password } = config.mysql;

const runSQLFile = async (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`⚠️  Fichier introuvable : ${filePath}`);
  }

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });

  const sql = fs.readFileSync(filePath, "utf8");

  try {
    await connection.query(sql);
    console.log(`✅ Script SQL exécuté avec succès \n→ ${filePath}`);
  } catch (err) {
    throw new Error(`⚠️  Erreur dans le fichier : ${filePath} → ${(err as Error).message}`);
  } finally {
    await connection.end();
  }
};

export default runSQLFile;
