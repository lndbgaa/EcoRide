import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASSWORD as string,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transporter;
