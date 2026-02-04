import { NotificationService } from "../../services/NotificationService";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { IUser } from "../../interfaces/entities/IUser";

// Mock dependencies
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

jest.mock("twilio", () => jest.fn());

const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
const mockTwilio = twilio as jest.Mocked<typeof twilio>;

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockTransporter: any;
  let mockTwilioClient: any;

  // Helper function to create complete IUser objects
  const createMockUser = (overrides: Partial<IUser> = {}): IUser =>
    ({
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      phone: "+1234567890",
      password: "hashedpassword",
      language: "pt-BR",
      isPremium: false,
      twoFactorEnabled: false,
      newsletterEnabled: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as IUser;

  beforeEach(() => {
    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn(),
    };

    // Create mock Twilio client
    mockTwilioClient = {
      messages: {
        create: jest.fn(),
      },
    };

    // Mock nodemailer.createTransport
    mockNodemailer.createTransport.mockReturnValue(mockTransporter);

    // Mock twilio
    (mockTwilio as any).mockReturnValue(mockTwilioClient);

    // Set environment variables
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@test.com";
    process.env.SMTP_PASS = "testpass";
    process.env.TWILIO_ACCOUNT_SID = "test_sid";
    process.env.TWILIO_AUTH_TOKEN = "test_token";
    process.env.TWILIO_PHONE_NUMBER = "+1234567890";

    // Create service instance
    notificationService = new NotificationService();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const recipient = "test@example.com";
      const subject = "Test Subject";
      const htmlContent = "<p>Test content</p>";

      mockTransporter.sendMail.mockResolvedValue({ messageId: "test123" });

      await notificationService.sendEmail(recipient, subject, htmlContent);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "M. Finnance AI <test@test.com>",
        to: recipient,
        subject,
        html: htmlContent,
      });
    });

    it("should handle email sending errors", async () => {
      const recipient = "test@example.com";
      const subject = "Test Subject";
      const htmlContent = "<p>Test content</p>";

      const error = new Error("SMTP Error");
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        notificationService.sendEmail(recipient, subject, htmlContent)
      ).rejects.toThrow("SMTP Error");
    });
  });

  describe("sendWhatsApp", () => {
    it("should send WhatsApp message successfully", async () => {
      const phoneNumber = "+1234567890";
      const message = "Test message";

      mockTwilioClient.messages.create.mockResolvedValue({ sid: "test123" });

      await notificationService.sendWhatsApp(phoneNumber, message);

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: "whatsapp:+1234567890",
        to: "whatsapp:+1234567890",
        body: message,
      });
    });

    it("should handle WhatsApp sending errors", async () => {
      const phoneNumber = "+1234567890";
      const message = "Test message";

      const error = new Error("Twilio Error");
      mockTwilioClient.messages.create.mockRejectedValue(error);

      await expect(
        notificationService.sendWhatsApp(phoneNumber, message)
      ).rejects.toThrow("Twilio Error");
    });
  });

  describe("sendBillReminder", () => {
    it("should send bill reminder via email and WhatsApp", async () => {
      const user = createMockUser({
        name: "João Silva",
        email: "joao@example.com",
        phone: "+1234567890",
      });

      const bill = {
        description: "Conta de Luz",
        amount: 150.5,
        dueDate: new Date("2024-01-15"),
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: "whatsapp123",
      });

      await notificationService.sendBillReminder(user, bill);

      // Check email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "M. Finnance AI <test@test.com>",
        to: user.email,
        subject: "Lembrete de Conta a Pagar - FinanceAI",
        html: expect.stringContaining("João Silva"),
      });

      // Check WhatsApp was sent
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: "whatsapp:+1234567890",
        to: "whatsapp:+1234567890",
        body: expect.stringContaining(
          "M. Finnance AI - Lembrete de Conta a Pagar"
        ),
      });
    });

    it("should send bill reminder via email only when user has no phone", async () => {
      const user = createMockUser({
        name: "João Silva",
        email: "joao@example.com",
        phone: undefined,
      });

      const bill = {
        description: "Conta de Luz",
        amount: 150.5,
        dueDate: new Date("2024-01-15"),
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });

      await notificationService.sendBillReminder(user, bill);

      // Check email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "M. Finnance AI <test@test.com>",
        to: user.email,
        subject: "Lembrete de Conta a Pagar - FinanceAI",
        html: expect.stringContaining("João Silva"),
      });

      // Check WhatsApp was NOT sent
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
    });

    it("should handle errors in bill reminder", async () => {
      const user = createMockUser({
        name: "João Silva",
        email: "joao@example.com",
        phone: "+1234567890",
      });

      const bill = {
        description: "Conta de Luz",
        amount: 150.5,
        dueDate: new Date("2024-01-15"),
      };

      const error = new Error("Email Error");
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        notificationService.sendBillReminder(user, bill)
      ).rejects.toThrow("Email Error");
    });
  });

  describe("sendGoalAchievedNotification", () => {
    it("should send goal achieved notification via email and WhatsApp", async () => {
      const user = createMockUser({
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "+1234567890",
      });

      const goal = {
        name: "Viagem para Europa",
        targetAmount: 10000,
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: "whatsapp123",
      });

      await notificationService.sendGoalAchievedNotification(user, goal);

      // Check email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "M. Finnance AI <test@test.com>",
        to: user.email,
        subject: "Meta Financeira Alcançada! - FinanceAI",
        html: expect.stringContaining("Maria Silva"),
      });

      // Check WhatsApp was sent
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        from: "whatsapp:+1234567890",
        to: "whatsapp:+1234567890",
        body: expect.stringContaining(
          "M. Finnance AI - Meta Financeira Alcançada!"
        ),
      });
    });

    it("should send goal achieved notification via email only when user has no phone", async () => {
      const user = createMockUser({
        name: "Maria Silva",
        email: "maria@example.com",
        phone: undefined,
      });

      const goal = {
        name: "Viagem para Europa",
        targetAmount: 10000,
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });

      await notificationService.sendGoalAchievedNotification(user, goal);

      // Check email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "M. Finnance AI <test@test.com>",
        to: user.email,
        subject: "Meta Financeira Alcançada! - FinanceAI",
        html: expect.stringContaining("Maria Silva"),
      });

      // Check WhatsApp was NOT sent
      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
    });

    it("should handle errors in goal achieved notification", async () => {
      const user = createMockUser({
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "+1234567890",
      });

      const goal = {
        name: "Viagem para Europa",
        targetAmount: 10000,
      };

      const error = new Error("Email Error");
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        notificationService.sendGoalAchievedNotification(user, goal)
      ).rejects.toThrow("Email Error");
    });
  });

  describe("constructor", () => {
    it("should initialize with correct configuration", () => {
      // Clear previous calls
      jest.clearAllMocks();

      // Create new service instance to test constructor
      new NotificationService();

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.test.com",
        port: 587,
        secure: false,
        auth: {
          user: "test@test.com",
          pass: "testpass",
        },
      });

      expect(mockTwilio).toHaveBeenCalledWith("test_sid", "test_token");
    });

    it("should handle secure port configuration", () => {
      process.env.SMTP_PORT = "465";

      new NotificationService();

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.test.com",
        port: 465,
        secure: true,
        auth: {
          user: "test@test.com",
          pass: "testpass",
        },
      });
    });
  });

  describe("error handling", () => {
    it("should log errors and rethrow them", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const error = new Error("Test Error");
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        notificationService.sendEmail("test@example.com", "Subject", "Content")
      ).rejects.toThrow("Test Error");

      expect(consoleSpy).toHaveBeenCalledWith("Error sending email:", error);

      consoleSpy.mockRestore();
    });

    it("should log WhatsApp errors and rethrow them", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const error = new Error("Twilio Error");
      mockTwilioClient.messages.create.mockRejectedValue(error);

      await expect(
        notificationService.sendWhatsApp("+1234567890", "Message")
      ).rejects.toThrow("Twilio Error");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error sending WhatsApp message:",
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe("formatting", () => {
    it("should format currency correctly in bill reminder", async () => {
      const user = createMockUser({
        name: "João Silva",
        email: "joao@example.com",
      });

      const bill = {
        description: "Conta de Luz",
        amount: 150.5,
        dueDate: new Date("2024-01-15"),
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });

      await notificationService.sendBillReminder(user, bill);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toMatch(/R\$\s*150,50/);
    });

    it("should format currency correctly in goal notification", async () => {
      const user = createMockUser({
        name: "Maria Silva",
        email: "maria@example.com",
      });

      const goal = {
        name: "Viagem para Europa",
        targetAmount: 10000,
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });

      await notificationService.sendGoalAchievedNotification(user, goal);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toMatch(/R\$\s*10\.000,00/);
    });

    it("should format date correctly in bill reminder", async () => {
      const user = createMockUser({
        name: "João Silva",
        email: "joao@example.com",
      });

      const bill = {
        description: "Conta de Luz",
        amount: 150.5,
        dueDate: new Date("2024-01-15"),
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "email123" });

      await notificationService.sendBillReminder(user, bill);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toMatch(/14\/01\/2024/);
    });
  });
});
