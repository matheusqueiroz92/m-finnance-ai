import { Document, Types } from 'mongoose';

export type SocialProvider = 'google' | 'facebook' | 'github';

export interface ISocialProfileData {
  provider: SocialProvider;
  providerId: string;
}

export interface ISocialUser {
  id: string;
  provider: SocialProvider;
  email: string;
  name: string;
  photo?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  dateOfBirth?: Date;
  cpf?: string;
  phone?: string;
  avatar?: string;
  language: string;
  isPremium: boolean;
  twoFactorEnabled: boolean;
  newsletterEnabled: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  socialProfiles?: ISocialProfileData[];
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
  avatar?: string;
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
  avatar?: string;
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
  avatar?: string;
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