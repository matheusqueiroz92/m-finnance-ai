import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { ICreditCard } from '../interfaces/entities/ICreditCard';

const creditCardSchema = new Schema<ICreditCard>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardNumber: {
      type: String,
      required: [true, 'Número do cartão é obrigatório'],
      minlength: 4,
      maxlength: 4, // Armazenar apenas os últimos 4 dígitos
    },
    cardBrand: {
      type: String,
      required: [true, 'Bandeira do cartão é obrigatória'],
      enum: ['visa', 'mastercard', 'elo', 'american_express', 'diners', 'hipercard', 'other'],
    },
    cardholderName: {
      type: String,
      required: [true, 'Nome do titular é obrigatório'],
      trim: true,
    },
    cardholderCpf: {
      type: String,
      required: [true, 'CPF do titular é obrigatório'],
    },
    expiryDate: {
      type: String,
      required: [true, 'Data de validade é obrigatória'],
      match: [/^\d{2}\/\d{2}$/, 'Data de validade deve estar no formato MM/YY'],
    },
    securityCode: {
      type: String,
      required: [true, 'Código de segurança é obrigatório'],
    },
    creditLimit: {
      type: Number,
      required: [true, 'Limite do cartão é obrigatório'],
      min: [0, 'Limite deve ser maior ou igual a zero'],
    },
    billingDueDay: {
      type: Number,
      required: [true, 'Dia de vencimento da fatura é obrigatório'],
      min: [1, 'Dia de vencimento deve ser entre 1 e 31'],
      max: [31, 'Dia de vencimento deve ser entre 1 e 31'],
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, 'Saldo utilizado não pode ser negativo'],
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

// Criptografar código de segurança antes de salvar
creditCardSchema.pre('save', async function (next) {
  if (!this.isModified('securityCode')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.securityCode = await bcrypt.hash(this.securityCode, salt);
  next();
});

// Virtual para limite disponível
creditCardSchema.virtual('availableLimit').get(function() {
  return this.creditLimit - this.currentBalance;
});

// Método para validar código de segurança
creditCardSchema.methods.validateSecurityCode = async function(code: string): Promise<boolean> {
  return bcrypt.compare(code, this.securityCode);
};

// Índice composto para evitar cartões duplicados
creditCardSchema.index({ user: 1, cardNumber: 1 }, { unique: true });

export const CreditCardModel = model<ICreditCard>('CreditCard', creditCardSchema);