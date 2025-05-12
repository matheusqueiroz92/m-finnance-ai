import { Document, Types } from 'mongoose';

export interface IAccount extends Document {
  user: Types.ObjectId;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  institution: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountDTO {
  _id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  institution: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountCreateDTO {
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance?: number;
  institution: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive?: boolean;
}

export interface IAccountUpdateDTO {
  name?: string;
  institution?: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive?: boolean;
}

export interface IAccountSummary {
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    institution: string;
  }[];
  summary: {
    totalBalance: number;
    totalPositiveBalance: number;
    totalNegativeBalance: number;
    accountCount: number;
  };
}