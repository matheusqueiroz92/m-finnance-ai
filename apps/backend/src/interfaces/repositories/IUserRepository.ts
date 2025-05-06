import { ClientSession } from 'mongoose';
import { IUser, IUserDTO } from '../entities/IUser';

export interface IUserRepository {
  create(userData: Partial<IUser>, options?: { session?: ClientSession }): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByIdAndUpdate(id: string, updateData: Partial<IUser>, options?: { session?: ClientSession }): Promise<IUser | null>;
  findAll(page: number, limit: number, filters?: any): Promise<{ users: IUser[]; total: number }>;
  update(id: string, updateData: Partial<IUser>, options?: { session?: ClientSession }): Promise<IUser | null>;
  delete(id: string): Promise<IUser | null>;
  checkPassword(id: string, password: string): Promise<boolean>;
}