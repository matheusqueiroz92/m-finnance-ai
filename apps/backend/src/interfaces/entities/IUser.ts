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

export interface IUserDTO {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  cpf?: string;
  phone?: string;
  language: string;
  isPremium: boolean;
  twoFactorEnabled: boolean;
  newsletterEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRegisterDTO {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: Date | string;
  cpf?: string;
  phone?: string;
  language?: string;
}

export interface IUserLoginDTO {
  email: string;
  password: string;
}

export interface IUserUpdateDTO {
  name?: string;
  email?: string;
  dateOfBirth?: Date | string;
  phone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  newsletterEnabled?: boolean;
}

export interface IChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface IAuthResult {
  user: IUserDTO;
  token: string;
}