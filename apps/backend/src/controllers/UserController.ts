import { Request, Response, NextFunction } from 'express';
import { injectable, inject, container } from 'tsyringe';
import { IUserService } from '../interfaces/services/IUserService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { userRegisterSchema, userUpdateSchema } from '../validators/userValidator';
import { ICategoryService } from '../interfaces/services/ICategoryService';
import { ZodError } from 'zod';
import { IUserRegisterDTO, IUserUpdateDTO } from '../interfaces/entities/IUser';

@injectable()
export class UserController {
  constructor(
    @inject('UserService')
    private userService: IUserService
  ) {}
  
  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Dados recebidos no registro:', req.body);
      console.log('Avatar recebido:', req.file);
      
      // Preparar os dados para validação
      const userData: IUserRegisterDTO = { // Especificar o tipo aqui
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        dateOfBirth: req.body.dateOfBirth,
        cpf: req.body.cpf,
        phone: req.body.phone,
        language: req.body.language || 'pt-BR',
      };
      
      // Adicionar avatar se existir - agora fora da validação
      if (req.file) {
        userData.avatar = req.file.path.replace(/\\/g, '/');
      }
      
      console.log('Dados preparados para validação:', userData);
      
      // Validar os dados manualmente
      try {
        // Usar o schema Zod para validação
        const validatedData = userRegisterSchema.parse(userData);
        console.log('Dados validados com sucesso:', validatedData);
        
        // Tratar o CPF - se for vazio ou undefined, remove o campo
        if (!validatedData.cpf || validatedData.cpf.trim() === '') {
          delete validatedData.cpf;
        }
        
        console.log('Dados finais para registro:', validatedData);
        
        // Registrar usuário
        const result = await this.userService.register(validatedData);
        
        // Criar categorias padrão para o novo usuário
        try {
          const categoryService = container.resolve<ICategoryService>('CategoryService');
          await categoryService.createDefaultCategories(result.user._id);
          console.log('Categorias padrão criadas com sucesso para o usuário:', result.user._id);
        } catch (error) {
          console.error('Erro ao criar categorias padrão:', error);
          // Continua mesmo se houver erro na criação das categorias
        }
        
        ApiResponse.created(res, result, 'Usuário registrado com sucesso');
      } catch (validationError) {
        // O resto do código permanece igual
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      next(error);
    }
  };
  
  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.body.email || !req.body.password) {
        throw new ApiError('Por favor, forneça email e senha', 400);
      }
      
      const result = await this.userService.login(req.body);
      
      ApiResponse.success(res, {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        isPremium: result.user.isPremium,
        token: result.token,
      }, 'Login realizado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get user profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.user._id);
      
      ApiResponse.success(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        cpf: user.cpf,
        phone: user.phone,
        language: user.language,
        isPremium: user.isPremium,
        twoFactorEnabled: user.twoFactorEnabled,
        newsletterEnabled: user.newsletterEnabled,
      }, 'Perfil recuperado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Dados recebidos para atualização de perfil:', req.body);
      console.log('Avatar recebido:', req.file);
      
      // Preparar os dados para validação
      const updateData: IUserUpdateDTO = {
        name: req.body.name,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
        phone: req.body.phone,
        language: req.body.language,
        twoFactorEnabled: req.body.twoFactorEnabled === 'true' ? true : 
                        req.body.twoFactorEnabled === 'false' ? false : undefined,
        newsletterEnabled: req.body.newsletterEnabled === 'true' ? true : 
                        req.body.newsletterEnabled === 'false' ? false : undefined,
      };
      
      // Adicionar avatar se existir
      if (req.file) {
        updateData.avatar = req.file.path.replace(/\\/g, '/');
      }
      
      // Remover campos undefined para não sobrescrever dados existentes
      Object.keys(updateData).forEach(key => {
        const typedKey = key as keyof IUserUpdateDTO;
        if (updateData[typedKey] === undefined) {
          delete updateData[typedKey];
        }
      });
      
      console.log('Dados preparados para validação:', updateData);
      
      // Validar os dados manualmente
      try {
        // Usar o schema Zod para validação
        const validatedData = userUpdateSchema.parse(updateData);
        console.log('Dados validados com sucesso:', validatedData);
        
        console.log('Dados finais para atualização de perfil:', validatedData);
        
        const result = await this.userService.updateProfile(req.user._id, validatedData);
        
        ApiResponse.success(res, result, 'Perfil atualizado com sucesso');
      } catch (validationError) {
        console.error('Erro de validação:', validationError);
        
        if (validationError instanceof ZodError) {
          const formattedErrors = validationError.errors.map(err => ({
            field: err.path.join('.') || 'dados',
            message: `Campo ${err.path.join('.') || 'desconhecido'}: ${err.message}`
          }));
          
          throw new ApiError('Erro de validação dos dados do perfil', 400, formattedErrors);
        } else {
          throw validationError;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      next(error);
    }
  };

  /**
   * Change user password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        throw new ApiError('Por favor, forneça a senha atual e a nova senha', 400);
      }
      
      await this.userService.changePassword(req.user._id, { currentPassword, newPassword });
      
      ApiResponse.success(res, null, 'Senha alterada com sucesso', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ApiError('Token de verificação é obrigatório', 400);
      }
      
      await this.userService.verifyEmail(token);
      
      ApiResponse.success(res, null, 'E-mail verificado com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Resend verification email
   */
  resendVerificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.resendVerificationEmail(req.user._id);
      
      ApiResponse.success(res, null, 'E-mail de verificação reenviado com sucesso');
    } catch (error) {
      next(error);
    }
  };
}