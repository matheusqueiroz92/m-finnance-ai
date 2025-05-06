import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUserService } from '../interfaces/services/IUserService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

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
      const result = await this.userService.register(req.body);
      
      ApiResponse.created(res, {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        isPremium: result.user.isPremium,
        token: result.token,
      }, 'Usuário registrado com sucesso');
    } catch (error) {
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
      const user = await this.userService.updateProfile(req.user._id, req.body);
      
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
      }, 'Perfil atualizado com sucesso');
    } catch (error) {
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
}