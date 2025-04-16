import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectMongo from "./config/mongo.js";

const app = express();
const PORT = process.env.PORT ?? 8080;

connectMongo();

app.get("/", (req, res) => {
  res.send("Bonjour!");
});

app.listen(PORT, () => {
  console.log(`✅ Le serveur tourne sur le port ${PORT}`);
});
