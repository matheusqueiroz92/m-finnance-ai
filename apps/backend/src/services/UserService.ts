import { injectable, inject, container } from 'tsyringe';
import crypto from 'crypto';
import { IUserService } from '../interfaces/services/IUserService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { 
  IUserRegisterDTO, 
  IUserLoginDTO, 
  IUserUpdateDTO, 
  IChangePasswordDTO, 
  IAuthResult, 
  IUserDTO,
  IUser,
  SocialProvider
} from '../interfaces/entities/IUser';
import { generateToken } from '../config/jwt';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';
import { INotificationService } from '../interfaces/services/INotificationService';
import { TokenUtils } from '../utils/TokenUtils';
import { ISubscriptionService } from '../interfaces/services/ISubscriptionService';
import { ISocialUser } from '../interfaces/entities/IAuth';
import { ICategoryService } from '../interfaces/services/ICategoryService';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('NotificationService')
    private notificationService: INotificationService,
    @inject('CategoryService')
    private categoryService: ICategoryService 
  ) {}

  /**
   * Register a new user
   */
  async register(userData: IUserRegisterDTO): Promise<{ user: IUserDTO; token: string }> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Verificar se usuário já existe
      const userExists = await this.userRepository.findByEmail(userData.email);
      
      if (userExists) {
        throw new ApiError('Usuário já existe', 400);
      }
      
      // Criar token de verificação de email
      const verificationToken = TokenUtils.generateEmailVerificationToken();
      const verificationExpires = TokenUtils.generateEmailVerificationExpiry();
      
      // Preparar dados do usuário - com conversão de tipos
      const processedUserData: any = {
        ...userData,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      };
      
      // Converter dateOfBirth para Date se for string
      if (typeof processedUserData.dateOfBirth === 'string') {
        processedUserData.dateOfBirth = new Date(processedUserData.dateOfBirth);
      }
      
      // Tratar o CPF - se for vazio ou undefined, remove o campo
      if (!processedUserData.cpf || processedUserData.cpf.trim() === '') {
        delete processedUserData.cpf;
      }
      
      // Criar usuário
      const user = await this.userRepository.create(processedUserData, { session });
      if (!user) {
        throw new ApiError('Erro ao criar usuário', 500);
      }
      
      // Enviar email de verificação
      await this.sendVerificationEmail(user);
      
      // Gerar token de autenticação
      const userId = user._id?.toString();
      if (!userId) {
        throw new ApiError('Erro ao gerar token - ID de usuário inválido', 500);
      }
      
      const token = generateToken(userId);
  
      const subscriptionService = container.resolve<ISubscriptionService>('SubscriptionService');
    
      try {
        // Criar assinatura de teste para o novo usuário
        await subscriptionService.createTrialSubscription(userId.toString());
      } catch (error) {
        console.error('Erro ao criar assinatura de teste:', error);
        // Continuar mesmo se houver erro na criação da assinatura
      }
      
      try {
        // Criar categorias padrão para o novo usuário
        await this.categoryService.createDefaultCategories(userId);
      } catch (error) {
        console.error('Erro ao criar categorias padrão:', error);
        // Continuar mesmo se houver erro na criação das categorias
      }
      
      return {
        user: this.sanitizeUser(user),
        token,
      };
    });
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
   * Login with social provider
   */
  async loginWithSocialProvider(profile: ISocialUser): Promise<IAuthResult> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Verificar se o email está disponível
      let email = profile.email;
      
      // Garantir que o provider é do tipo correto
      const provider = profile.provider as SocialProvider;
      
      // GitHub e alguns outros provedores podem não fornecer email diretamente
      if (!email && provider === 'github') {
        // Opção 1: Gerar email temporário (não ideal para produção)
        email = `${provider}-${profile.id}@tempmail.organfinancialai.com`;
        console.warn(`Usuário ${provider} sem email disponível: ${profile.id}. Usando email temporário.`);
      }
      
      if (!email) {
        throw new ApiError('Email não disponível pelo provedor social', 400);
      }
      
      // Verificar se o usuário já existe com este email
      let user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        // Criar novo usuário
        const randomPassword = crypto.randomBytes(16).toString('hex');
        
        const userData: Partial<IUser> = {
          name: profile.name || `Usuário ${provider}`,
          email: email,
          password: randomPassword,
          isEmailVerified: true,
          socialProfiles: [{
            provider,
            providerId: profile.id
          }]
        };
        
        if (profile.photo) {
          userData.avatar = profile.photo;
        }
        
        const createdUser = await this.userRepository.create(userData, { session });
        
        if (!createdUser) {
          throw new ApiError('Falha ao criar usuário', 500);
        }
        
        user = createdUser;
        
        // Criar assinatura de teste para o novo usuário
        try {
          const subscriptionService = container.resolve<ISubscriptionService>('SubscriptionService');
          await subscriptionService.createTrialSubscription(user._id.toString());
        } catch (error) {
          console.error('Erro ao criar assinatura de teste:', error);
        }
        
        // Opcionalmente, criar categorias padrão para o novo usuário
        try {
          const categoryService = container.resolve<ICategoryService>('CategoryService');
          await categoryService.createDefaultCategories(user._id.toString());
        } catch (error) {
          console.error('Erro ao criar categorias padrão:', error);
        }
      } else {
        // Verificar se já tem perfil social deste provedor
        const hasSocialProfile = user.socialProfiles && 
          user.socialProfiles.some(p => p.provider === provider && p.providerId === profile.id);
        
        if (!hasSocialProfile) {
          // Adicionar perfil social ao usuário existente
          const socialProfiles = user.socialProfiles || [];
          
          socialProfiles.push({
            provider, // Usar a variável tipada
            providerId: profile.id
          });
          
          const updatedUser = await this.userRepository.update(user._id.toString(), { 
            socialProfiles 
          }, { session });
          
          if (updatedUser) {
            user = updatedUser;
          }
        }
        
        // Se o usuário tinha uma foto de perfil padrão e o provedor social fornece uma, atualizar
        if (profile.photo && (!user.avatar || user.avatar.includes('default-avatar'))) {
          const updatedUser = await this.userRepository.update(user._id.toString(), {
            avatar: profile.photo
          }, { session });
          
          if (updatedUser) {
            user = updatedUser;
          }
        }
      }
      
      // Se chegamos aqui, user não pode ser null
      if (!user) {
        throw new ApiError('Erro inesperado ao processar login social', 500);
      }
      
      // Gerar token
      const token = generateToken(user._id.toString());
      
      // Registrar login social no log (opcional)
      console.info(`Login social bem-sucedido: ${provider} para usuário ${user._id} (${user.email})`);
      
      return {
        user: this.sanitizeUser(user),
        token
      };
    });
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
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    
    if (!user) {
      throw new ApiError('Token de verificação inválido', 400);
    }
    
    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new ApiError('Token de verificação expirado', 400);
    }
    
    // Obter o ID do usuário
    const userId = user._id?.toString();
    if (!userId) {
      throw new ApiError('ID de usuário inválido', 500);
    }
    
    // Atualizar usuário como verificado
    await this.userRepository.update(userId, {
      isEmailVerified: true,
      emailVerificationToken: undefined, // Usar undefined em vez de null
      emailVerificationExpires: undefined, // Usar undefined em vez de null
    });
  }
  
  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new ApiError('Usuário não encontrado', 404);
    }
    
    if (user.isEmailVerified) {
      throw new ApiError('E-mail já verificado', 400);
    }
    
    // Gerar novo token
    const verificationToken = TokenUtils.generateEmailVerificationToken();
    const verificationExpires = TokenUtils.generateEmailVerificationExpiry();
    
    // Atualizar usuário
    await this.userRepository.update(userId, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });
    
    // Criar um novo objeto user com os dados atualizados
    const updatedUser: IUser = {
      ...user.toObject(),
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    };
    
    // Enviar email
    await this.sendVerificationEmail(updatedUser);
  }
  
  /**
   * Send verification email to user
   */
  private async sendVerificationEmail(user: IUser): Promise<void> {
    // Verificar se temos o ID do usuário
    const userId = user._id?.toString();
    if (!userId || !user.emailVerificationToken) {
      console.error('Erro ao enviar e-mail de verificação: dados de usuário incompletos');
      return;
    }
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerificationToken}`;
    
    const emailSubject = 'Verifique seu e-mail - FinanceAI';
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${user.name}!</h2>
        <p>Bem-vindo ao FinanceAI. Por favor, confirme seu endereço de e-mail clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verificar E-mail
          </a>
        </div>
        <p>Ou copie e cole o seguinte link no seu navegador:</p>
        <p>${verificationUrl}</p>
        <p>Este link expirará em 24 horas.</p>
        <p>Se você não se cadastrou no FinanceAI, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe FinanceAI</p>
      </div>
    `;
    
    try {
      await this.notificationService.sendEmail(user.email, emailSubject, emailContent);
    } catch (error) {
      console.error('Erro ao enviar e-mail de verificação:', error);
      // Não lançamos o erro para não interromper o fluxo de cadastro
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