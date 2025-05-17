import { Schema, model } from 'mongoose';
import { IInvestment } from '../interfaces/entities/IInvestment';

interface IInvestmentDocument extends IInvestment {
  calculatePerformance(): {
    absoluteReturn: number;
    percentageReturn: number;
    annualizedReturn?: number;
  };
}

const investmentSchema = new Schema<IInvestmentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nome do investimento é obrigatório'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Tipo de investimento é obrigatório'],
      enum: ['stock', 'bond', 'mutualFund', 'etf', 'cryptocurrency', 'savings', 'realEstate', 'pension', 'other'],
    },
    symbol: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      min: [0, 'Quantidade não pode ser negativa'],
    },
    initialValue: {
      type: Number,
      required: [true, 'Valor inicial é obrigatório'],
      min: [0, 'Valor inicial não pode ser negativo'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Valor atual é obrigatório'],
      min: [0, 'Valor atual não pode ser negativo'],
    },
    acquisitionDate: {
      type: Date,
      required: [true, 'Data de aquisição é obrigatória'],
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    performance: {
      absoluteReturn: {
        type: Number,
        default: 0,
      },
      percentageReturn: {
        type: Number,
        default: 0,
      },
      annualizedReturn: {
        type: Number,
      },
    },
    provider: {
      type: String,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    transactions: [{
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    }],
  },
  {
    timestamps: true,
  }
);

// Middleware para calcular o desempenho antes de salvar
investmentSchema.pre('save', function (next) {
  if (this.isModified('initialValue') || this.isModified('currentValue')) {
    const performance = this.calculatePerformance();
    this.performance = performance;
  }
  next();
});

// Método para calcular o desempenho do investimento
investmentSchema.methods.calculatePerformance = function() {
  const absoluteReturn = this.currentValue - this.initialValue;
  const percentageReturn = this.initialValue > 0 
    ? (absoluteReturn / this.initialValue) * 100 
    : 0;
  
  // Cálculo do retorno anualizado (se tiver data de aquisição)
  let annualizedReturn;
  if (this.acquisitionDate) {
    const now = new Date();
    const acquisitionDate = new Date(this.acquisitionDate);
    const yearDiff = (now.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearDiff > 0) {
      // Fórmula para cálculo do retorno anualizado: (1 + r)^t - 1
      // Onde r é o retorno total e t é o tempo em anos
      const r = this.currentValue / this.initialValue;
      annualizedReturn = (Math.pow(r, 1 / yearDiff) - 1) * 100;
    }
  }
  
  return {
    absoluteReturn,
    percentageReturn,
    annualizedReturn,
  };
};

export const InvestmentModel = model<IInvestmentDocument>('Investment', investmentSchema);