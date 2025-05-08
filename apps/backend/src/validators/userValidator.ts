import { z } from 'zod';

export const userRegisterSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  language: z.string().optional().default('pt-BR'),
  avatar: z.string().optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  phone: z.string().optional(),
  language: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  newsletterEnabled: z.boolean().optional(),
  avatar: z.string().optional(), // Adicione esta propriedade
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;