import { z } from 'zod';

export const accountCreateSchema = z.object({
  name: z.string().min(2, 'O nome da conta deve ter pelo menos 2 caracteres'),
  type: z.enum(['checking', 'savings', 'investment', 'credit'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser checking, savings, investment ou credit' })
  }),
  balance: z.number().default(0),
  institution: z.string().min(2, 'Nome da instituição é obrigatório'),
  accountNumber: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(2, 'O nome da conta deve ter pelo menos 2 caracteres').optional(),
  institution: z.string().min(2, 'Nome da instituição é obrigatório').optional(),
  accountNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});