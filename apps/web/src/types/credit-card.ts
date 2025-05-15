export interface CreditCard {
    _id: string;
    cardNumber: string; // Últimos 4 dígitos
    cardBrand: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'other';
    cardholderName: string;
    cardholderCpf: string; // Mascarado
    expiryDate: string; // MM/YY
    creditLimit: number;
    billingDueDay: number;
    currentBalance: number;
    availableLimit: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreditCardCreate {
    cardNumber: string;
    cardBrand: 'visa' | 'mastercard' | 'elo' | 'american_express' | 'diners' | 'hipercard' | 'other';
    cardholderName: string;
    cardholderCpf: string;
    expiryDate: string;
    securityCode: string;
    creditLimit: number;
    billingDueDay: number;
  }
  
  export interface CreditCardUpdate {
    cardholderName?: string;
    expiryDate?: string;
    securityCode?: string;
    creditLimit?: number;
    billingDueDay?: number;
    isActive?: boolean;
  }
  
  export interface CreditCardBalance {
    creditLimit: number;
    currentBalance: number;
    availableLimit: number;
    percentageUsed: number;
  }