export interface CreditCard {
  _id: string;
  cardNumber: string;
  cardBrand: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'other';
  cardholderName: string;
  cardholderCpf: string;
  expiryDate: string;
  creditLimit: number;
  billingDueDay: number;
  currentBalance: number;
  availableLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCardCreateData {
  cardNumber: string;
  cardBrand: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'other';
  cardholderName: string;
  cardholderCpf: string;
  expiryDate: string;
  securityCode: string;
  creditLimit: number;
  billingDueDay: number;
}

export interface CreditCardUpdateData {
  cardholderName?: string;
  expiryDate?: string;
  securityCode?: string;
  creditLimit?: number;
  billingDueDay?: number;
  isActive?: boolean;
}

export interface CreditCardBilling {
  _id: string;
  creditCard: string;
  cardName: string;
  closingDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAmount?: number;
  paidDate?: string;
  transactions?: CreditCardTransaction[];
}

export interface CreditCardTransaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  installments?: {
    current: number;
    total: number;
  };
}

export interface CreditCardSummary {
  totalCards: number;
  totalCreditLimit: number;
  totalAvailableLimit: number;
  totalCurrentBalance: number;
  nextDueDate: string;
  nextDueAmount: number;
}