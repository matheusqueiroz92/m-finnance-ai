import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { IUser } from '../interfaces/entities/IUser';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { UserModel } from '../schemas/UserSchema';
import bcrypt from 'bcrypt';

@injectable()
export class UserRepository implements IUserRepository {
  async create(userData: Partial<IUser>, options?: { session?: ClientSession }): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save(options);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await UserModel.findById(id);
  }

  async findByIdAndUpdate(id: string, updateData: Partial<IUser>, options?: { session?: ClientSession }): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return await UserModel.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true,
      ...options 
    });
  }

  async findAll(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
      
      // Adicionar busca por CPF se for um número
      if (/^\d+$/.test(filters.search)) {
        query.$or.push({ cpf: filters.search });
      }
    }
    
    const [users, total] = await Promise.all([
      UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(query)
    ]);
    
    return { users, total };
  }

  async update(id: string, updateData: Partial<IUser>, options?: { session?: ClientSession }): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return await UserModel.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true,
      ...options 
    });
  }

  async delete(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await UserModel.findByIdAndDelete(id);
  }

  async checkPassword(id: string, password: string): Promise<boolean> {
    const user = await UserModel.findById(id);
    if (!user) return false;
    return await user.comparePassword(password);
  }

  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return await UserModel.findOne({ emailVerificationToken: token });
  }
}