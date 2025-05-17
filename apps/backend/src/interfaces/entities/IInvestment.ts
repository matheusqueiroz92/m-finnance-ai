import { Document, Types } from 'mongoose';

export type InvestmentType = 
  'stock' | 
  'bond' | 
  'mutualFund' | 
  'etf' | 
  'cryptocurrency' | 
  'savings' | 
  'realEstate' | 
  'pension' | 
  'other';

export interface IInvestment extends Document {
  user: Types.ObjectId;
  name: string;
  type: InvestmentType;
  symbol?: string;
  amount: number;
  initialValue: number;
  currentValue: number;
  acquisitionDate: Date;
  notes?: string;
  isActive: boolean;
  performance?: {
    absoluteReturn: number;
    percentageReturn: number;
    annualizedReturn?: number;
  };
  provider?: string; // banco, corretora, exchange, etc.
  account: Types.ObjectId | {
    _id: Types.ObjectId;
    name: string;
    type: string;
    institution?: string;
  }; // relação com a conta
  transactions?: Types.ObjectId[]; // transações relacionadas a esse investimento
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvestmentDTO {
  _id: string;
  name: string;
  type: InvestmentType;
  symbol?: string;
  amount: number;
  initialValue: number;
  currentValue: number;
  acquisitionDate: Date;
  notes?: string;
  isActive: boolean;
  performance: {
    absoluteReturn: number;
    percentageReturn: number;
    annualizedReturn?: number;
  };
  provider?: string;
  account: {
    _id: string;
    name: string;
    type: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvestmentCreateDTO {
  name: string;
  type: InvestmentType;
  symbol?: string;
  amount: number;
  initialValue: number;
  currentValue: number;
  acquisitionDate: Date | string;
  notes?: string;
  provider?: string;
  account: string; // ID da conta
}

export interface IInvestmentUpdateDTO {
  name?: string;
  type?: InvestmentType;
  symbol?: string;
  amount?: number;
  currentValue?: number;
  notes?: string;
  isActive?: boolean;
  provider?: string;
}

export interface IInvestmentSummaryDTO {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturn: {
    value: number;
    percentage: number;
  };
  investmentsByType: {
    type: string;
    totalInvested: number;
    totalCurrentValue: number;
    percentage: number;
  }[];
  topPerformers: IInvestmentDTO[];
  worstPerformers: IInvestmentDTO[];
}

export interface IInvestmentFilters {
  type?: InvestmentType;
  isActive?: boolean;
  account?: string;
  page: number;
  limit: number;
}

export interface IInvestmentListResult {
  investments: IInvestmentDTO[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}