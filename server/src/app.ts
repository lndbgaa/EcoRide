import express from "express";

import appConfig from "@/config/app.config.js";
import { connectMongoDB } from "@/config/mongo.config.js";
import { connectMySQL } from "@/config/mysql.config.js";

const app = express();
const PORT = appConfig.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const start = async () => {
  try {
    await connectMySQL();
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`✅ Server: Started successfully on port ${PORT}`);
    });
  } catch (err) {
    console.error(`❌ Server startup error: ${(err as Error).message}`);
    process.exit(1);
  }
};

start();
