import { z } from 'zod';

export const transactionCreateSchema = z.object({
  account: z.string().min(1, 'Conta é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().positive('O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense', 'investment'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser income, expense ou investment' })
  }),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().optional(),
});

export const transactionUpdateSchema = z.object({
  account: z.string().min(1, 'Conta é obrigatória').optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  amount: z.number().positive('O valor deve ser maior que zero').optional(),
  type: z.enum(['income', 'expense', 'investment'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser income, expense ou investment' })
  }).optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().optional(),
});

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense', 'investment']).optional(),
  category: z.string().optional(),
  account: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});