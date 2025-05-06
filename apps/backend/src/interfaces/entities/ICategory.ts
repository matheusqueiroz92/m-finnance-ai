import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  user: Types.ObjectId;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDTO {
  _id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryCreateDTO {
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface ICategoryUpdateDTO {
  name?: string;
  icon?: string;
  color?: string;
}