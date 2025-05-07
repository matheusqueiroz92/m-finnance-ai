
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { protect } from '../middlewares/authMiddleware';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { TransactionService } from '../services/TransactionService';
import { container } from '../config/container';

const router = express.Router();
const transactionService = container.resolve(TransactionService);

// Rota para obter avatar do usuário (público)
router.get('/avatar/:filename', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const filename = req.params.filename || '';
    const filePath = path.join(__dirname, '../../uploads/avatars', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new ApiError('Arquivo não encontrado', 404);
    }
    
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

// Rota para obter um anexo de uma transação (protegida)
router.get('/attachment/:transactionId/:attachmentId', protect, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { transactionId, attachmentId } = req.params;
    
    if (!transactionId || !attachmentId) {
      throw new ApiError('ID da transação e do anexo são obrigatórios', 400);
    }
    
    // Buscar a transação
    const transaction = await transactionService.getTransactionById(transactionId, req.user._id);
    
    // Verificar se o anexo existe
    if (!transaction.attachments || transaction.attachments.length === 0) {
      throw new ApiError('Transação não possui anexos', 404);
    }
    
    // Encontrar o anexo pelo ID
    const attachment = transaction.attachments.find((a: any) => 
      a._id && a._id.toString() === attachmentId
    );
    
    if (!attachment) {
      throw new ApiError('Anexo não encontrado', 404);
    }
    
    // Verificar se o arquivo existe
    const filePath = path.resolve(attachment.path);
    if (!fs.existsSync(filePath)) {
      throw new ApiError('Arquivo não encontrado no sistema', 404);
    }
    
    // Enviar o arquivo
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

// Rota para listar anexos de uma transação (protegida)
router.get('/attachments/:transactionId', protect, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      throw new ApiError('ID da transação é obrigatório', 400);
    }
    
    // Buscar a transação
    const transaction = await transactionService.getTransactionById(transactionId, req.user._id);
    
    // Verificar se há anexos
    if (!transaction.attachments || transaction.attachments.length === 0) {
      ApiResponse.success(res, [], 'Transação não possui anexos');
      return;
    }
    
    // Mapear apenas as informações necessárias dos anexos
    const attachmentsInfo = transaction.attachments.map((a: any) => ({
      id: a._id,
      type: a.type,
      description: a.description,
      uploadedAt: a.uploadedAt,
      filename: path.basename(a.path)
    }));
    
    ApiResponse.success(res, attachmentsInfo, 'Anexos recuperados com sucesso');
  } catch (error) {
    next(error);
  }
});

// Rota para download de um anexo (protegida)
router.get('/download/attachment/:transactionId/:attachmentId', protect, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { transactionId, attachmentId } = req.params;
    
    if (!transactionId || !attachmentId) {
      throw new ApiError('ID da transação e do anexo são obrigatórios', 400);
    }
    
    // Buscar a transação
    const transaction = await transactionService.getTransactionById(transactionId, req.user._id);
    
    // Verificar se o anexo existe
    if (!transaction.attachments || transaction.attachments.length === 0) {
      throw new ApiError('Transação não possui anexos', 404);
    }
    
    // Encontrar o anexo pelo ID
    const attachment = transaction.attachments.find((a: any) => 
      a._id && a._id.toString() === attachmentId
    );
    
    if (!attachment) {
      throw new ApiError('Anexo não encontrado', 404);
    }
    
    // Verificar se o arquivo existe
    const filePath = path.resolve(attachment.path);
    if (!fs.existsSync(filePath)) {
      throw new ApiError('Arquivo não encontrado no sistema', 404);
    }
    
    // Configurar cabeçalhos para download
    const filename = path.basename(attachment.path);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Determinar o tipo MIME com base na extensão do arquivo
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Padrão para download genérico
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }
    
    res.setHeader('Content-Type', contentType);
    
    // Enviar o arquivo
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;