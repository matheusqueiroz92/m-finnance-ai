import { injectable, inject } from 'tsyringe';
import { IUserService } from '../interfaces/services/IUserService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { 
  IUserRegisterDTO, 
  IUserLoginDTO, 
  IUserUpdateDTO, 
  IChangePasswordDTO, 
  IAuthResult, 
  IUserDTO,
  IUser
} from '../interfaces/entities/IUser';
import { generateToken } from '../config/jwt';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository
  ) {}

  /**
   * Register a new user
   */
  async register(userData: IUserRegisterDTO): Promise<IAuthResult> {
    // Check if user already exists
    const userExists = await this.userRepository.findByEmail(userData.email);
    
    if (userExists) {
      throw new ApiError('Usuário já existe', 400);
    }
    
    // Converter dateOfBirth de string para Date, se necessário
    const processedUserData: any = {
      ...userData,
      isPremium: false,
      twoFactorEnabled: false,
      newsletterEnabled: true
    };
    
    // Se dateOfBirth for uma string, converter para Date
    if (typeof userData.dateOfBirth === 'string') {
      processedUserData.dateOfBirth = new Date(userData.dateOfBirth);
    }
    
    // Create new user
    const user = await this.userRepository.create(processedUserData);

    if (!user) {
      throw new ApiError('Erro ao criar usuário', 500);
    }
    
    // Generate token - Converter _id para string com verificação de tipo
    const userId = user._id?.toString();
    if (!userId) {
      throw new ApiError('Erro ao gerar token', 500);
    }
    
    const token = generateToken(userId);
    
    // Return user data without password
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }
  
  /**
   * Authenticate a user
   */
  async login(credentials: IUserLoginDTO): Promise<IAuthResult> {
    const user = await this.userRepository.findByEmail(credentials.email);
    
    if (!user) {
      throw new ApiError('Credenciais inválidas', 401);
    }
    
    const isPasswordMatch = await user.comparePassword(credentials.password);
    
    if (!isPasswordMatch) {
      throw new ApiError('Credenciais inválidas', 401);
    }
    
    // Generate token - Com verificação de tipo
    const userId = user._id?.toString();
    if (!userId) {
      throw new ApiError('Erro ao gerar token', 500);
    }
    
    const token = generateToken(userId);
    
    // Return user data without password
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUserDTO> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new ApiError('Usuário não encontrado', 404);
    }
    
    return this.sanitizeUser(user);
  }
  
  /**
   * Get all users with pagination and filters
   */
  async getAllUsers(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ users: IUserDTO[]; total: number }> {
    const result = await this.userRepository.findAll(page, limit, filters);
    
    // Remove passwords from user objects
    const usersWithoutPasswords = result.users.map(user => this.sanitizeUser(user));
    
    return {
      users: usersWithoutPasswords,
      total: result.total
    };
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: IUserUpdateDTO): Promise<IUserDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Ensure email is not being changed to an existing email
      if (updateData.email) {
        const userWithEmail = await this.userRepository.findByEmail(updateData.email);
        
        if (userWithEmail && userWithEmail._id && userWithEmail._id.toString() !== userId) {
          throw new ApiError('Email já está em uso', 400);
        }
      }
      
      // Processar dateOfBirth se for string
      const processedUpdateData: any = { ...updateData };
      if (typeof updateData.dateOfBirth === 'string') {
        processedUpdateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }
      
      const updatedUser = await this.userRepository.update(userId, processedUpdateData, { session });
      
      if (!updatedUser) {
        throw new ApiError('Usuário não encontrado', 404);
      }
      
      return this.sanitizeUser(updatedUser);
    });
  }
  
  /**
   * Change user password
   */
  async changePassword(userId: string, { currentPassword, newPassword }: IChangePasswordDTO): Promise<void> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Verify current password
      const isPasswordValid = await this.userRepository.checkPassword(userId, currentPassword);
      
      if (!isPasswordValid) {
        throw new ApiError('Senha atual incorreta', 400);
      }
      
      // Update password
      const updatedUser = await this.userRepository.update(userId, { password: newPassword }, { session });
      
      if (!updatedUser) {
        throw new ApiError('Falha ao atualizar senha', 500);
      }
    });
  }
  
  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    const deletedUser = await this.userRepository.delete(userId);
    
    if (!deletedUser) {
      throw new ApiError('Usuário não encontrado', 404);
    }
  }
  
  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: IUser): IUserDTO {
    // Verificar se o método toObject existe
    const userObj = user.toObject ? user.toObject() : user;
    
    // Usar tipagem mais segura e desestruturação
    const { password, ...userWithoutPassword } = userObj as any;
    
    return userWithoutPassword;
  }
}