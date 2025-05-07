import { 
    IUserRegisterDTO, 
    IUserLoginDTO, 
    IUserUpdateDTO, 
    IChangePasswordDTO,
    IAuthResult,
    IUserDTO
  } from '../entities/IUser';
  
  export interface IUserService {
    register(userData: IUserRegisterDTO): Promise<IAuthResult>;
    login(credentials: IUserLoginDTO): Promise<IAuthResult>;
    loginWithSocialProvider(profileData: any): Promise<IAuthResult>;
    getUserById(userId: string): Promise<IUserDTO>;
    getAllUsers(page?: number, limit?: number, filters?: any): Promise<{ users: IUserDTO[]; total: number }>;
    updateProfile(userId: string, updateData: IUserUpdateDTO): Promise<IUserDTO>;
    changePassword(userId: string, passwordData: IChangePasswordDTO): Promise<void>;
    deleteUser(userId: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    resendVerificationEmail(email: string): Promise<void>;
  }