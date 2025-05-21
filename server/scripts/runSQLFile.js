import dotenv from "dotenv";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = process.env.NODE_ENV ?? "development";
const envPath = path.resolve(process.cwd(), `.env.${env}`);
dotenv.config({ path: envPath });

const runSQLFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`⚠️  Fichier introuvable : ${filePath}`);
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PWD,
    database: process.env.MYSQL_DB_NAME,
    multipleStatements: true,
  });

  const sql = fs.readFileSync(filePath, "utf8");

  try {
    await connection.query(sql);
    console.log(`✅ Script SQL exécuté avec succès \n→ ${filePath}`);
  } catch (err) {
    throw new Error(`⚠️  Erreur dans le fichier : ${filePath} → ${err.message}`);
  } finally {
    await connection.end();
  }
};

export default runSQLFile;
