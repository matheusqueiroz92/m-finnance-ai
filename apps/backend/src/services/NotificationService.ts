import nodemailer from 'nodemailer';
import twilio from 'twilio';
import User, { IUser } from '../models/UserModel';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;
  
  constructor() {
    // Configure email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465', // true for port 465, false otherwise
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Configure Twilio client
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  
  /**
   * Send email notification
   */
  async sendEmail(
    recipient: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: `FinanceAI <${process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        html: htmlContent,
      });
      
      console.log(`Email sent to ${recipient}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
  /**
   * Send WhatsApp notification
   */
  async sendWhatsApp(
    phoneNumber: string,
    message: string
  ): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        body: message,
      });
      
      console.log(`WhatsApp message sent to ${phoneNumber}`);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
  
  /**
   * Send notification about bill due date
   */
  async sendBillReminder(
    user: IUser,
    bill: { description: string; amount: number; dueDate: Date }
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(bill.amount);
    
    const formattedDate = new Intl.DateTimeFormat('pt-BR').format(bill.dueDate);
    
    // Send email notification
    const emailSubject = 'Lembrete de Conta a Pagar - FinanceAI';
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${user.name}!</h2>
        <p>Este é um lembrete sobre uma conta próxima do vencimento:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Descrição:</strong> ${bill.description}</p>
          <p><strong>Valor:</strong> ${formattedAmount}</p>
          <p><strong>Data de Vencimento:</strong> ${formattedDate}</p>
        </div>
        <p>Acesse o FinanceAI para mais detalhes e para gerenciar suas finanças.</p>
        <p>Atenciosamente,<br>Equipe FinanceAI</p>
      </div>
    `;
    
    await this.sendEmail(user.email, emailSubject, emailContent);
    
    // Send WhatsApp notification if phone number is available
    if (user.phone) {
      const whatsAppMessage = `
FinanceAI - Lembrete de Conta a Pagar

Olá, ${user.name}!
Você tem uma conta próxima do vencimento:

Descrição: ${bill.description}
Valor: ${formattedAmount}
Data de Vencimento: ${formattedDate}

Acesse o FinanceAI para mais detalhes.
      `;
      
      await this.sendWhatsApp(user.phone, whatsAppMessage);
    }
  }
  
  /**
   * Send notification about reaching a financial goal
   */
  async sendGoalAchievedNotification(
    user: IUser,
    goal: { name: string; targetAmount: number }
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(goal.targetAmount);
    
    // Send email notification
    const emailSubject = 'Meta Financeira Alcançada! - FinanceAI';
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Parabéns, ${user.name}! 🎉</h2>
        <p>Você atingiu sua meta financeira:</p>
        <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Meta:</strong> ${goal.name}</p>
          <p><strong>Valor Economizado:</strong> ${formattedAmount}</p>
        </div>
        <p>Continue com o bom trabalho! Acesse o FinanceAI para definir novas metas e continuar gerenciando suas finanças de forma inteligente.</p>
        <p>Atenciosamente,<br>Equipe FinanceAI</p>
      </div>
    `;
    
    await this.sendEmail(user.email, emailSubject, emailContent);
    
    // Send WhatsApp notification if phone number is available
    if (user.phone) {
      const whatsAppMessage = `
FinanceAI - Meta Financeira Alcançada! 🎉

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