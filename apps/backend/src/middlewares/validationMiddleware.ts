import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: AnyZodObject) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Validar o corpo da requisição com o schema Zod
    const validatedData = schema.parse(req.body);
    
    // Atualizar o req.body com os dados validados (e possivelmente transformados)
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Formatar os erros de validação
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      next(new ApiError('Erro de validação', 400, formattedErrors));
    } else {
      next(error);
    }
  }
};

export const validateQueryParams = (schema: AnyZodObject) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Validar os parâmetros de consulta com o schema Zod
    const validatedData = schema.parse(req.query);
    
    // Atualizar o req.query com os dados validados
    req.query = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Formatar os erros de validação
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      next(new ApiError('Erro de validação nos parâmetros de consulta', 400, formattedErrors));
    } else {
      next(error);
    }
  }
};

export const validateParams = (schema: AnyZodObject) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Validar os parâmetros de rota com o schema Zod
    const validatedData = schema.parse(req.params);
    
    // Atualizar o req.params com os dados validados
    req.params = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Formatar os erros de validação
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      next(new ApiError('Erro de validação nos parâmetros de rota', 400, formattedErrors));
    } else {
      next(error);
    }
  }
};