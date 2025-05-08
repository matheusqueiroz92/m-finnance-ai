import { z } from 'zod';

export const transactionCreateSchema = z.object({
  account: z.string().min(1, 'Conta é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().positive('O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense', 'investment'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser income, expense ou investment' })
  }),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().or(z.date()).optional().default(() => new Date()),
  isRecurring: z.boolean().optional().default(false),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().optional(),
  // Esses campos são apenas para processamento, não vão para o banco
  fileType: z.string().optional(),
  fileDescription: z.string().optional(),
}).refine(data => {
  // Se isRecurring for true, recurrenceInterval é obrigatório
  if (data.isRecurring && !data.recurrenceInterval) {
    return false;
  }
  return true;
}, {
  message: 'Intervalo de recorrência é obrigatório para transações recorrentes',
  path: ['recurrenceInterval'],
});

export const transactionUpdateSchema = z.object({
  account: z.string().min(1, 'Conta é obrigatória').optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  amount: z.number().positive('O valor deve ser maior que zero').optional(),
  type: z.enum(['income', 'expense', 'investment'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser income, expense ou investment' })
  }).optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  date: z.string().or(z.date()).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  notes: z.string().optional(),
}).refine(data => {
  // Se isRecurring for true e recurrenceInterval não estiver definido no update
  // então verificamos se existe um recurrenceInterval
  if (data.isRecurring === true && data.recurrenceInterval === undefined) {
    return false;
  }
  return true;
}, {
  message: 'Intervalo de recorrência é obrigatório para transações recorrentes',
  path: ['recurrenceInterval'],
});

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense', 'investment']).optional(),
  category: z.string().optional(),
  account: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;