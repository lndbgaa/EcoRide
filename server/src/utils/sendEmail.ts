import type { Transporter } from "nodemailer";

async function sendEmail(transporter: Transporter, from: string, to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}

export default sendEmail;
