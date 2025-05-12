import { z } from 'zod';

export const accountCreateSchema = z.object({
  name: z.string().min(2, 'O nome da conta deve ter pelo menos 2 caracteres'),
  type: z.enum(['checking', 'savings', 'investment', 'credit'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser checking, savings, investment ou credit' })
  }),
  balance: z.number().default(0),
  institution: z.string().min(2, 'Nome da instituição é obrigatório'),
  bankBrach: z.string().optional(),
  accountNumber: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(2, 'O nome da conta deve ter pelo menos 2 caracteres').optional(),
  institution: z.string().min(2, 'Nome da instituição é obrigatório').optional(),
  bankBrach: z.string().optional(),
  accountNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;