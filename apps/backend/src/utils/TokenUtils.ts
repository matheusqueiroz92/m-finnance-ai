import crypto from 'crypto';

export class TokenUtils {
  /**
   * Gera um token aleatório para verificação de email
   */
  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Gera uma data de expiração para o token (24 horas)
   */
  static generateEmailVerificationExpiry(): Date {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Expira em 24 horas
    return expires;
  }
}