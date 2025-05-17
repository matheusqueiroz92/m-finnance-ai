import { z } from 'zod';

export const investmentCreateSchema = z.object({
  name: z.string().min(2, 'O nome do investimento deve ter pelo menos 2 caracteres'),
  type: z.enum(
    ['stock', 'bond', 'mutualFund', 'etf', 'cryptocurrency', 'savings', 'realEstate', 'pension', 'other'], 
    { errorMap: () => ({ message: 'Tipo inválido de investimento' }) }
  ),
  symbol: z.string().optional(),
  amount: z.number().positive('A quantidade deve ser maior que zero'),
  initialValue: z.number().nonnegative('O valor inicial não pode ser negativo'),
  currentValue: z.number().nonnegative('O valor atual não pode ser negativo'),
  acquisitionDate: z.string().transform(val => new Date(val)),
  notes: z.string().optional(),
  provider: z.string().optional(),
  account: z.string().min(1, 'Conta é obrigatória'),
});

export const investmentUpdateSchema = z.object({
  name: z.string().min(2, 'O nome do investimento deve ter pelo menos 2 caracteres').optional(),
  type: z.enum(
    ['stock', 'bond', 'mutualFund', 'etf', 'cryptocurrency', 'savings', 'realEstate', 'pension', 'other'], 
    { errorMap: () => ({ message: 'Tipo inválido de investimento' }) }
  ).optional(),
  symbol: z.string().optional(),
  amount: z.number().positive('A quantidade deve ser maior que zero').optional(),
  currentValue: z.number().nonnegative('O valor atual não pode ser negativo').optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  provider: z.string().optional(),
});

export const investmentFilterSchema = z.object({
  type: z.enum(
    ['stock', 'bond', 'mutualFund', 'etf', 'cryptocurrency', 'savings', 'realEstate', 'pension', 'other']
  ).optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
  account: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type InvestmentCreateInput = z.infer<typeof investmentCreateSchema>;
export type InvestmentUpdateInput = z.infer<typeof investmentUpdateSchema>;
export type InvestmentFilterInput = z.infer<typeof investmentFilterSchema>;