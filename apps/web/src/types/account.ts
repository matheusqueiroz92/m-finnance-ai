export interface Account {
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

export interface AccountCreateData {
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance?: number;
  institution: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive?: boolean;
}

export interface AccountUpdateData {
  name?: string;
  institution?: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive?: boolean;
}

export interface AccountSummary {
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