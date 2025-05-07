export interface User {
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  cpf?: string;
  phone?: string;
  language?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  newsletterEnabled?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}