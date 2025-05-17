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
    creditCard: {
      type: Schema.Types.ObjectId,
      ref: 'CreditCard',
      required: false,
    },
    investment: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
      required: false,
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
    attachments: [{
      path: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['receipt', 'invoice', 'contract', 'other'],
        default: 'receipt'
      },
      description: {
        type: String
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, account: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, investment: 1 }); // Novo índice para consultas por investimento

export const TransactionModel = model<ITransaction>('Transaction', transactionSchema);