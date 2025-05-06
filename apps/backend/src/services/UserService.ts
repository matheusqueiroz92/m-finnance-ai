import { ApiError } from '../utils/ApiError';
import { UserModelClass } from '../models/UserModel';
import { generateToken } from '../config/jwt';
import { 
  UserRegisterInput, 
  UserLoginInput, 
  UserUpdateInput, 
  ChangePasswordInput 
} from '../validators/userValidator';

export class UserService {
  private userModel: UserModelClass;

  constructor() {
    this.userModel = new UserModelClass();
  }

  /**
   * Register a new user
   */
  async register(userData: UserRegisterInput): Promise<{ user: any; token: string }> {
    // Check if user already exists
    const userExists = await this.userModel.findByEmail(userData.email);
    
    if (userExists) {
      throw new ApiError('Usuário já existe', 400);
    }
    
    // Create new user
    const user = await this.userModel.create(userData);
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user.toObject();
    
    return {
      user: userWithoutPassword,
      token,
    };
  }
  
  /**
   * Authenticate a user
   */
  async login(credentials: UserLoginInput): Promise<{ user: any; token: string }> {
    const user = await this.userModel.findByEmail(credentials.email);
    
    if (!user) {
      throw new ApiError('Credenciais inválidas', 401);
    }
    
    const isPasswordMatch = await user.comparePassword(credentials.password);
    
    if (!isPasswordMatch) {
      throw new ApiError('Credenciais inválidas', 401);
    }
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user.toObject();
    
    return {
      user: userWithoutPassword,
      token,
    };
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new ApiError('Usuário não encontrado', 404);
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
  
  /**
   * Get all users with pagination and filters
   */
  async getAllUsers(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ users: any[]; total: number }> {
    const result = await this.userModel.findAll(page, limit, filters);
    
    // Remove passwords from user objects
    const usersWithoutPasswords = result.users.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });
    
    return {
      users: usersWithoutPasswords,
      total: result.total
    };
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UserUpdateInput): Promise<any> {
    // Ensure email is not being changed to an existing email
    if (updateData.email) {
      const userWithEmail = await this.userModel.findByEmail(updateData.email);
      
      if (userWithEmail && userWithEmail._id.toString() !== userId) {
        throw new ApiError('Email já está em uso', 400);
      }
    }
    
    const updatedUser = await this.userModel.update(userId, updateData);
    
    if (!updatedUser) {
      throw new ApiError('Usuário não encontrado', 404);
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = updatedUser.toObject();
    return userWithoutPassword;
  }
  
  /**
   * Change user password
   */
  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput): Promise<void> {
    // Verify current password
    const isPasswordValid = await this.userModel.checkPassword(userId, currentPassword);
    
    if (!isPasswordValid) {
      throw new ApiError('Senha atual incorreta', 400);
    }
    
    // Update password
    await this.userModel.update(userId, { password: newPassword });
  }
  
  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    const deletedUser = await this.userModel.delete(userId);
    
    if (!deletedUser) {
      throw new ApiError('Usuário não encontrado', 404);
    }
  }
}