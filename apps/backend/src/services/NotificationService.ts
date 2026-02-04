import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { INotificationService } from "../interfaces/services/INotificationService";
import { IUser } from "../interfaces/entities/IUser";

@injectable()
export class NotificationService implements INotificationService {
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio | null;

  constructor() {
    // Configure email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465", // true for port 465, false otherwise
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Configure Twilio client only if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.log(
        "⚠️ Twilio credentials not configured - WhatsApp/SMS notifications disabled"
      );
      this.twilioClient = null;
    }
  }

  /**
   * Send email notification
   * @param recipient - The email address of the recipient
   * @param subject - The subject of the email
   * @param htmlContent - The HTML content of the email
   * @returns A promise that resolves when the email is sent
   */
  async sendEmail(
    recipient: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: `M. Finnance AI <${process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        html: htmlContent,
      });

      console.log(`Email sent to ${recipient}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Send WhatsApp notification
   * @param phoneNumber - The phone number of the recipient
   * @param message - The message to send
   * @returns A promise that resolves when the WhatsApp message is sent
   */
  async sendWhatsApp(phoneNumber: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      console.log("⚠️ Twilio not configured - WhatsApp message not sent");
      return;
    }

    try {
      await this.twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        body: message,
      });

      console.log(`WhatsApp message sent to ${phoneNumber}`);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  }

  /**
   * Send notification about bill due date
   * @param user - The user to send the notification to
   * @param bill - The bill to send the notification for
   * @returns A promise that resolves when the bill reminder is sent
   */
  async sendBillReminder(
    user: IUser,
    bill: { description: string; amount: number; dueDate: Date }
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(bill.amount);

    const formattedDate = new Intl.DateTimeFormat("pt-BR").format(bill.dueDate);

    // Send email notification
    const emailSubject = "Lembrete de Conta a Pagar - FinanceAI";
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${user.name}!</h2>
        <p>Este é um lembrete sobre uma conta próxima do vencimento:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Descrição:</strong> ${bill.description}</p>
          <p><strong>Valor:</strong> ${formattedAmount}</p>
          <p><strong>Data de Vencimento:</strong> ${formattedDate}</p>
        </div>
        <p>Acesse o M. Finnance AI para mais detalhes e para gerenciar suas finanças.</p>
        <p>Atenciosamente,<br>Equipe M. Finnance AI</p>
      </div>
    `;

    await this.sendEmail(user.email, emailSubject, emailContent);

    // Send WhatsApp notification if phone number is available
    if (user.phone) {
      const whatsAppMessage = `
        M. Finnance AI - Lembrete de Conta a Pagar

        Olá, ${user.name}!
        Você tem uma conta próxima do vencimento:

        Descrição: ${bill.description}
        Valor: ${formattedAmount}
        Data de Vencimento: ${formattedDate}

        Acesse o M. Finnance AI para mais detalhes.
      `;

      await this.sendWhatsApp(user.phone, whatsAppMessage);
    }
  }

  /**
   * Send notification about reaching a financial goal
   * @param user - The user to send the notification to
   * @param goal - The goal to send the notification for
   * @returns A promise that resolves when the goal achieved notification is sent
   */
  async sendGoalAchievedNotification(
    user: IUser,
    goal: { name: string; targetAmount: number }
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(goal.targetAmount);

    // Send email notification
    const emailSubject = "Meta Financeira Alcançada! - FinanceAI";
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Parabéns, ${user.name}! 🎉</h2>
        <p>Você atingiu sua meta financeira:</p>
        <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Meta:</strong> ${goal.name}</p>
          <p><strong>Valor Economizado:</strong> ${formattedAmount}</p>
        </div>
        <p>Continue com o bom trabalho! Acesse o M. Finnance AI para definir novas metas e continuar gerenciando suas finanças de forma inteligente.</p>
        <p>Atenciosamente,<br>Equipe M. Finnance AI</p>
      </div>
    `;

    await this.sendEmail(user.email, emailSubject, emailContent);

    // Send WhatsApp notification if phone number is available
    if (user.phone) {
      const whatsAppMessage = `
        M. Finnance AI - Meta Financeira Alcançada! 🎉

        Parabéns, ${user.name}!
        Você atingiu sua meta financeira:

        Meta: ${goal.name}
        Valor Economizado: ${formattedAmount}

        Continue com o bom trabalho! Acesse o FinanceAI para definir novas metas.
      `;

      await this.sendWhatsApp(user.phone, whatsAppMessage);
    }
  }
}
