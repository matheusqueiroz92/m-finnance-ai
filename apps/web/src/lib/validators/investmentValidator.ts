import { z } from 'zod';

export const investmentCreateSchema = z.object({
  name: z.string().min(2, 'O nome do investimento deve ter pelo menos 2 caracteres'),
  type: z.enum(['stock', 'bond', 'fund', 'crypto', 'cash', 'other'], {
    errorMap: () => ({ message: 'Tipo inválido de investimento' })
  }),
  ticker: z.string().optional(),
  institution: z.string().min(2, 'A instituição é obrigatória'),
  investedValue: z.number().positive('O valor investido deve ser maior que zero'),
  currentValue: z.number().nonnegative('O valor atual não pode ser negativo').optional(),
  acquisitionDate: z.string(),
  notes: z.string().optional(),
});

export const investmentUpdateSchema = z.object({
  name: z.string().min(2, 'O nome do investimento deve ter pelo menos 2 caracteres').optional(),
  ticker: z.string().optional(),
  institution: z.string().min(2, 'A instituição é obrigatória').optional(),
  investedValue: z.number().positive('O valor investido deve ser maior que zero').optional(),
  currentValue: z.number().nonnegative('O valor atual não pode ser negativo').optional(),
  notes: z.string().optional(),
});