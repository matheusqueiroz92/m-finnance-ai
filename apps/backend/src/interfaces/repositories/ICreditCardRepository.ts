import { ClientSession } from 'mongoose';
import { ICreditCard } from '../entities/ICreditCard';

export interface ICreditCardRepository {
  create(data: Partial<ICreditCard>, options?: { session?: ClientSession }): Promise<ICreditCard>;
  findById(id: string, userId?: string): Promise<ICreditCard | null>;
  findByUser(userId: string, isActive?: boolean): Promise<ICreditCard[]>;
  findByCardNumber(userId: string, cardNumber: string): Promise<ICreditCard | null>;
  update(id: string, userId: string, data: Partial<ICreditCard>, options?: { session?: ClientSession }): Promise<ICreditCard | null>;
  delete(id: string, userId: string): Promise<boolean>;
  updateBalance(id: string, userId: string, amount: number, options?: { session?: ClientSession }): Promise<ICreditCard | null>;
}