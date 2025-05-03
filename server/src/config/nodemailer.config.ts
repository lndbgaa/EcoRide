import nodemailer from "nodemailer";

import config from "@/config/app.config.js";

const { host, port, user, pass } = config.nodemailer;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass,
  },
});

export default transporter;
