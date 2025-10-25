import nodemailer from "nodemailer";

import { appConfig } from "@/config";

const { user, password } = appConfig.gmail;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass: password,
  },
});

export { transporter };
