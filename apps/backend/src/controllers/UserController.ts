import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { ApiError } from '../utils/ApiError';

export class UserController {
  private userService: UserService;
  
  constructor() {
    this.userService = new UserService();
  }
  
  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, dateOfBirth, cpf, phone, language } = req.body;
      
      const result = await this.userService.register({
        name,
        email,
        password,
        dateOfBirth,
        cpf,
        phone,
        language,
      });
      
      res.status(201).json({
        success: true,
        data: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          isPremium: result.user.isPremium,
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials = {
        email: req.body.email,
        password: req.body.password,
      }
      
      if (!credentials.email || !credentials.password) {
        throw new ApiError('Please provide email and password', 400);
      }
      
      const result = await this.userService.login(credentials);
      
      res.status(200).json({
        success: true,
        data: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          isPremium: result.user.isPremium,
          token: result.token,
        },
      });
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
      
      res.status(200).json({
        success: true,
        data: {
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
        },
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updateData = {
        name: req.body.name,
        dateOfBirth: req.body.dateOfBirth,
        phone: req.body.phone,
        language: req.body.language,
        twoFactorEnabled: req.body.twoFactorEnabled,
        newsletterEnabled: req.body.newsletterEnabled,
      };
      
      const user = await this.userService.updateProfile(req.user._id, updateData);
      
      res.status(200).json({
        success: true,
        data: {
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
        },
      });
    } catch (error) {
      next(error);
    }
  };
}