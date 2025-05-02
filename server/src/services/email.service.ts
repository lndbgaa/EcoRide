import ejs from "ejs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import transporter from "@/config/nodemailer.config.js";
import AppError from "@/utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface EmailRecipient {
  email: string;
  data: Record<string, unknown>;
}

class EmailService {
  /**
   * Rend le contenu d'un template EJS.
   * @param template - Le chemin du template.
   * @param data - Les données à injecter dans le template.
   * @returns Le contenu du template.
   */
  public static async renderTemplate(
    template: string,
    data: Record<string, unknown>
  ): Promise<string> {
    try {
      const templatePath = path.join(
        __dirname,
        "..",
        "templates",
        "emails",
        template
      );
      const html = await ejs.renderFile(templatePath, data);
      return html;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new AppError({
        statusCode: 500,
        statusText: "Internal Server Error",
        message: `Échec de rendu du template ${template}: ${errorMessage}`,
      });
    }
  }

  /**
   * Envoie un email.
   * @param to - L'adresse email du destinataire.
   * @param subject - Le sujet de l'email.
   * @param html - Le contenu de l'email.
   */
  public static async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  }

  /**
   * Envoie un email à plusieurs destinataires.
   * @param recipients - Les destinataires et leurs données.
   * @param subject - Le sujet de l'email.
   * @param template - Le chemin du template à utiliser.
   */
  public static async sendBulkEmail(
    recipients: EmailRecipient[],
    subject: string,
    template: string
  ): Promise<void> {
    const results = await Promise.allSettled(
      recipients.map(async ({ email, data }) => {
        try {
          const content = await this.renderTemplate(template, data);
          return await this.sendEmail(email, subject, content);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          throw new AppError({
            statusCode: 500,
            statusText: "Internal Server Error",
            message: `Échec d'envoi d'e-mail à ${email}: ${errorMessage}`,
          });
        }
      })
    );
  }
}

export default EmailService;
