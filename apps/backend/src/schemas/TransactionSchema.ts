import { Schema, model } from 'mongoose';
import { ITransaction } from '../interfaces/entities/ITransaction';

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
    },
    type: {
      type: String,
      required: [true, 'Tipo de transação é obrigatório'],
      enum: ['income', 'expense', 'investment'],
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Data é obrigatória'],
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceInterval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    attachments: {
      type: [String],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = model<ITransaction>('Transaction', transactionSchema);