export class ApiError extends Error {
  statusCode: number;
  errors?: any[];
  
  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Propriedade name para facilitar a identificação do erro
    this.name = this.constructor.name;
    
    // Isso captura o stack trace correto no Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Subclasses para erros específicos
export class NotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado', errors?: any[]) {
    super(message, 404, errors);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Erro de validação', errors?: any[]) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Não autorizado', errors?: any[]) {
    super(message, 401, errors);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Acesso negado', errors?: any[]) {
    super(message, 403, errors);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Erro interno do servidor', errors?: any[]) {
    super(message, 500, errors);
  }
}