import jwt, { Secret, JwtPayload, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Garante que a chave secreta existe
const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não está definido no ambiente");
  }
  return secret;
};

// Gera o JWT com as informações do usuário
export const generateToken = (userId: string): string => {
  const secret = getJwtSecret();
  const payload = { id: userId };
  
  // Definir um tempo de expiração mais longo (24 horas)
  const options: SignOptions = { 
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'] || '24h'
  };
  
  // Chamada mais explícita para evitar problemas de tipo
  return jwt.sign(payload, secret, options);
};

// Verifica se o token é válido
export const verifyToken = (token: string): JwtPayload => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as JwtPayload;
};

export default {
  generateToken,
  verifyToken,
};