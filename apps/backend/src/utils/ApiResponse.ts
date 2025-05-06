import { Response } from 'express';

export class ApiResponse {
  /**
   * Resposta de sucesso padrão
   */
  static success(
    res: Response, 
    data: any, 
    message: string = 'Operação realizada com sucesso', 
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Resposta de erro padrão
   */
  static error(
    res: Response, 
    message: string = 'Erro interno do servidor', 
    statusCode: number = 500, 
    errors?: any[]
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Resposta para criação de recursos
   */
  static created(
    res: Response, 
    data: any, 
    message: string = 'Recurso criado com sucesso'
  ): Response {
    return this.success(res, data, message, 201);
  }
  
  /**
   * Resposta para recursos não encontrados
   */
  static notFound(
    res: Response, 
    message: string = 'Recurso não encontrado'
  ): Response {
    return this.error(res, message, 404);
  }
  
  /**
   * Resposta para requisições inválidas
   */
  static badRequest(
    res: Response, 
    message: string = 'Requisição inválida', 
    errors?: any[]
  ): Response {
    return this.error(res, message, 400, errors);
  }
  
  /**
   * Resposta para requisições não autorizadas
   */
  static unauthorized(
    res: Response, 
    message: string = 'Não autorizado'
  ): Response {
    return this.error(res, message, 401);
  }
  
  /**
   * Resposta paginada para listas
   */
  static paginated(
    res: Response, 
    data: any[], 
    page: number, 
    limit: number, 
    total: number,
    message: string = 'Recursos recuperados com sucesso'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });
  }
}