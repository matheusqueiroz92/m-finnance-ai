import { z } from 'zod';

export const transactionCreateSchema = z.object({
  account: z.string().min(1, 'Conta é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  creditCard: z.string().optional(),
  investment: z.string().optional(), // Adicionado campo de investimento
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
  
  // Se o tipo for 'investment', o campo investment deve estar preenchido
  if (data.type === 'investment' && !data.investment) {
    return false;
  }
  
  return true;
}, {
  message: 'Intervalo de recorrência é obrigatório para transações recorrentes ou ID do investimento é obrigatório para transações do tipo investimento',
  path: ['recurrenceInterval', 'investment'],
});

export const transactionUpdateSchema = z.object({
  account: z.string().min(1, 'Conta é obrigatória').optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  creditCard: z.string().optional(),
  investment: z.string().optional(), // Adicionado campo de investimento
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
  
  // Se o tipo for alterado para 'investment' e o campo investment não estiver definido
  if (data.type === 'investment' && data.investment === undefined) {
    return false;
  }
  
  return true;
}, {
  message: 'Intervalo de recorrência é obrigatório para transações recorrentes ou ID do investimento é obrigatório para transações do tipo investimento',
  path: ['recurrenceInterval', 'investment'],
});

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense', 'investment']).optional(),
  category: z.string().optional(),
  account: z.string().optional(),
  investment: z.string().optional(), // Adicionado filtro por investimento
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;