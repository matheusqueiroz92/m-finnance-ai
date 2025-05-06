import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { AccountModel } from '../schemas/AccountSchema';
import { IAccountRepository } from '../interfaces/repositories/IAccountRepository';
import { IAccount } from '../interfaces/entities/IAccount';

@injectable()
export class AccountRepository implements IAccountRepository {
  async create(data: Partial<IAccount>, options?: { session?: ClientSession }): Promise<IAccount> {
    const account = new AccountModel(data);
    return await account.save(options);
  }

  async findById(id: string, userId?: string): Promise<IAccount | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    return await AccountModel.findOne(query);
  }

  async findByUser(userId: string, filters: any = {}): Promise<IAccount[]> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    return await AccountModel.find(query).sort({ name: 1 });
  }

  async countByUser(userId: string, filters: any = {}): Promise<number> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    return await AccountModel.countDocuments(query);
  }

  async update(id: string, userId: string, data: Partial<IAccount>, options?: { session?: ClientSession }): Promise<IAccount | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await AccountModel.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await AccountModel.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
  }

  async findAll(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ accounts: IAccount[]; total: number }> {
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (filters.user) query.user = filters.user;
    if (filters.type) query.type = filters.type;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    const [accounts, total] = await Promise.all([
      AccountModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      AccountModel.countDocuments(query)
    ]);
    
    return { accounts, total };
  }
}