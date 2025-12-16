import { appConfig, transporter } from "@/config";
import { renderTemplate } from "@/utils";

interface EmailRecipient {
  email: string;
  data: Record<string, unknown>;
}

const { env } = appConfig;

export class EmailService {
  /**
   *
   * @param from -
   * @param to -
   * @param subject -
   * @param html -
   */
  public static async sendEmail(from: string, to: string, subject: string, html: string): Promise<void> {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }

  /**
   *
   * @param from -
   * @param recipients -
   * @param subject -
   * @param template -
   */
  public static async sendBulkEmail(
    from: string,
    recipients: EmailRecipient[],
    subject: string,
    template: string
  ): Promise<void> {
    await Promise.allSettled(
      recipients.map(async ({ email, data }) => {
        try {
          const content = await renderTemplate(template, data);
          await this.sendEmail(from, email, subject, content);
        } catch (err) {
          const maskedEmail = env === "production" ? email.replace(/(.{2}).+(@.+)/, "$1***$2") : email;
          console.warn(`Failed to send email to ${maskedEmail}: ${(err as Error).message}`);
        }
      })
    );
  }
}
