import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);
  
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Erro interno do servidor';
  const errors = err instanceof ApiError ? err.errors : undefined;
  
  // Resposta para ambiente de produção
  if (process.env.NODE_ENV === 'production') {
    // Em produção, não enviar o stack trace
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(errors && { errors }),
      },
    });
  } else {
    // Em desenvolvimento, enviar o stack trace para facilitar a depuração
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(errors && { errors }),
        stack: err.stack,
      },
    });
  }
};