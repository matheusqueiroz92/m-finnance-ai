import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: Date;
  cpf?: string;
  phone?: string;
  language: string;
  isPremium: boolean;
  twoFactorEnabled: boolean;
  newsletterEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel {
  create(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByIdAndUpdate(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  findAll(page: number, limit: number, filters?: any): Promise<{ users: IUser[]; total: number }>;
  update(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<IUser | null>;
  checkPassword(id: string, password: string): Promise<boolean>;
}