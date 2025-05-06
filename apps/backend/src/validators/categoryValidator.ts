import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres'),
  type: z.enum(['income', 'expense', 'investment'], {
    errorMap: () => ({ message: 'Tipo inválido. Deve ser income, expense ou investment' })
  }),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;