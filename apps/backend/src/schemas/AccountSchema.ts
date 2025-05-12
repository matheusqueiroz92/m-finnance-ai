import { Schema, model } from 'mongoose';
import { IAccount } from '../interfaces/entities/IAccount';

const accountSchema = new Schema<IAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nome da conta é obrigatório'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Tipo de conta é obrigatório'],
      enum: ['checking', 'savings', 'investment', 'credit'],
    },
    balance: {
      type: Number,
      default: 0,
    },
    institution: {
      type: String,
      required: [true, 'Nome da instituição é obrigatório'],
      trim: true,
    },
    bankBranch: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AccountModel = model<IAccount>('Account', accountSchema);