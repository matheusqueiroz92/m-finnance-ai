import { z } from 'zod';

export const goalCreateSchema = z.object({
  name: z.string().min(2, 'O nome da meta deve ter pelo menos 2 caracteres'),
  targetAmount: z.number().positive('O valor alvo deve ser maior que zero'),
  currentAmount: z.number().nonnegative('O valor atual não pode ser negativo').default(0),
  startDate: z.string().optional(),
  targetDate: z.string(),
  category: z.string().optional(),
  icon: z.string().optional(),
  notes: z.string().optional(),
});

export const goalUpdateSchema = z.object({
  name: z.string().min(2, 'O nome da meta deve ter pelo menos 2 caracteres').optional(),
  targetAmount: z.number().positive('O valor alvo deve ser maior que zero').optional(),
  currentAmount: z.number().nonnegative('O valor atual não pode ser negativo').optional(),
  targetDate: z.string().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  notes: z.string().optional(),
});