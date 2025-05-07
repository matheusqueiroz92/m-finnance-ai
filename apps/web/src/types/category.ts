export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreateData {
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface CategoryUpdateData {
  name?: string;
  icon?: string;
  color?: string;
}