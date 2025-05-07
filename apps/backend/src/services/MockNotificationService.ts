import { injectable } from 'tsyringe';
import { INotificationService } from '../interfaces/services/INotificationService';
import { IUser } from '../interfaces/entities/IUser';

@injectable()
export class MockNotificationService implements INotificationService {
  sendEmail(recipient: string, subject: string, htmlContent: string): Promise<void> {
      throw new Error('Method not implemented.');
  }
  sendWhatsApp(phoneNumber: string, message: string): Promise<void> {
      throw new Error('Method not implemented.');
  }
  sendBillReminder(user: IUser, bill: { description: string; amount: number; dueDate: Date; }): Promise<void> {
      throw new Error('Method not implemented.');
  }
  async sendGoalAchievedNotification(user: IUser, goal: { name: string; targetAmount: number }): Promise<void> {
    console.log(`✅ [MOCK] Notificação simulada para o usuário ${user._id} sobre a meta "${goal.name}" de R$${goal.targetAmount}`);
  }
}
