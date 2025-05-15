import { z } from 'zod';

export const creditCardCreateSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Número do cartão deve ter pelo menos 13 dígitos')
    .max(19, 'Número do cartão deve ter no máximo 19 dígitos')
    .regex(/^\d+$/, 'Número do cartão deve conter apenas dígitos'),
  cardBrand: z.enum(['visa', 'mastercard', 'elo', 'american_express', 'diners', 'hipercard', 'other'], {
    errorMap: () => ({ message: 'Bandeira inválida' })
  }),
  cardholderName: z.string()
    .min(3, 'Nome do titular deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do titular deve ter no máximo 100 caracteres'),
  cardholderCpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  expiryDate: z.string()
    .regex(/^\d{2}\/\d{2}$/, 'Data de validade deve estar no formato MM/YY'),
  securityCode: z.string()
    .min(3, 'Código de segurança deve ter pelo menos 3 dígitos')
    .max(4, 'Código de segurança deve ter no máximo 4 dígitos')
    .regex(/^\d+$/, 'Código de segurança deve conter apenas dígitos'),
  creditLimit: z.number()
    .positive('Limite de crédito deve ser maior que zero'),
  billingDueDay: z.number()
    .min(1, 'Dia de vencimento deve ser entre 1 e 31')
    .max(31, 'Dia de vencimento deve ser entre 1 e 31')
});

export const creditCardUpdateSchema = z.object({
  cardholderName: z.string()
    .min(3, 'Nome do titular deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do titular deve ter no máximo 100 caracteres')
    .optional(),
  expiryDate: z.string()
    .regex(/^\d{2}\/\d{2}$/, 'Data de validade deve estar no formato MM/YY')
    .optional(),
  securityCode: z.string()
    .min(3, 'Código de segurança deve ter pelo menos 3 dígitos')
    .max(4, 'Código de segurança deve ter no máximo 4 dígitos')
    .regex(/^\d+$/, 'Código de segurança deve conter apenas dígitos')
    .optional(),
  creditLimit: z.number()
    .positive('Limite de crédito deve ser maior que zero')
    .optional(),
  billingDueDay: z.number()
    .min(1, 'Dia de vencimento deve ser entre 1 e 31')
    .max(31, 'Dia de vencimento deve ser entre 1 e 31')
    .optional(),
  isActive: z.boolean().optional()
});

export const validateSecurityCodeSchema = z.object({
  securityCode: z.string()
    .min(3, 'Código de segurança deve ter pelo menos 3 dígitos')
    .max(4, 'Código de segurança deve ter no máximo 4 dígitos')
    .regex(/^\d+$/, 'Código de segurança deve conter apenas dígitos')
});

export type CreditCardCreateInput = z.infer<typeof creditCardCreateSchema>;
export type CreditCardUpdateInput = z.infer<typeof creditCardUpdateSchema>;
export type ValidateSecurityCodeInput = z.infer<typeof validateSecurityCodeSchema>;