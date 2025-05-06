import { Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/entities/ICategory';

const categorySchema = new Schema<ICategory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nome da categoria é obrigatório'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Tipo de categoria é obrigatório'],
      enum: ['income', 'expense', 'investment'],
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = model<ICategory>('Category', categorySchema);