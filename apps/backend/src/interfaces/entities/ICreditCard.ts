import { Document, Types } from 'mongoose';

export interface ICreditCard extends Document {
  user: Types.ObjectId;
  cardNumber: string; // Armazenar apenas os últimos 4 dígitos por segurança
  cardBrand: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'other';
  cardholderName: string;
  cardholderCpf: string;
  expiryDate: string; // Formato MM/YY
  securityCode: string; // Armazenar criptografado
  creditLimit: number;
  billingDueDay: number; // Dia do vencimento da fatura (1-31)
  currentBalance: number; // Saldo atual utilizado
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  validateSecurityCode(code: string): Promise<boolean>;
}

export interface ICreditCardDTO {
  _id: string;
  cardNumber: string; // Mostrar apenas últimos 4 dígitos
  cardBrand: string;
  cardholderName: string;
  cardholderCpf: string; // Mostrar mascarado
  expiryDate: string;
  creditLimit: number;
  billingDueDay: number;
  currentBalance: number;
  availableLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreditCardCreateDTO {
  cardNumber: string;
  cardBrand: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'other';
  cardholderName: string;
  cardholderCpf: string;
  expiryDate: string;
  securityCode: string;
  creditLimit: number;
  billingDueDay: number;
}

export interface ICreditCardUpdateDTO {
  cardholderName?: string;
  expiryDate?: string;
  securityCode?: string;
  creditLimit?: number;
  billingDueDay?: number;
  isActive?: boolean;
}

export interface ICreditCardBalance {
  creditLimit: number;
  currentBalance: number;
  availableLimit: number;
  percentageUsed: number;
}