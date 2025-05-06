import { IUser } from '../entities/IUser';

export interface INotificationService {
  sendEmail(recipient: string, subject: string, htmlContent: string): Promise<void>;
  sendWhatsApp(phoneNumber: string, message: string): Promise<void>;
  sendBillReminder(
    user: IUser,
    bill: { description: string; amount: number; dueDate: Date }
  ): Promise<void>;
  sendGoalAchievedNotification(
    user: IUser,
    goal: { name: string; targetAmount: number }
  ): Promise<void>;
}