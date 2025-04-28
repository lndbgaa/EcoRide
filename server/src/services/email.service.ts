import transporter from "@/config/nodemailer.config.js";
import ejs from "ejs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    const templatePath = path.join(__dirname, "..", "templates", "emails", template);
    const html = await ejs.renderFile(templatePath, data);
    return html;
  }

  /**
   * Envoie un email.
   * @param to - L'adresse email du destinataire.
   * @param subject - Le sujet de l'email.
   * @param html - Le contenu de l'email.
   */
  public static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  }
}

export default EmailService;
