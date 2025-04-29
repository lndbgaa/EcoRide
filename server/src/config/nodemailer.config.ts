import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

import { getEnvVar } from "@/config/app.config.js";

const transporter = nodemailer.createTransport({
  host: getEnvVar("SMTP_HOST"),
  port: parseInt(getEnvVar("SMTP_PORT")),
  secure: false,
  auth: {
    user: getEnvVar("SMTP_USER"),
    pass: getEnvVar("SMTP_PASSWORD"),
  },
});

export default transporter;
