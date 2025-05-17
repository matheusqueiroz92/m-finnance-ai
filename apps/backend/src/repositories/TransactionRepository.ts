import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { TransactionModel } from '../schemas/TransactionSchema';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { ITransaction, ITransactionPopulated } from '../interfaces/entities/ITransaction';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  async create(data: Partial<ITransaction>, options?: { session?: ClientSession }): Promise<ITransactionPopulated> {
    const transaction = new TransactionModel(data);
    const saved = await transaction.save(options);
    
    return (await saved.populate([
      { path: 'category', select: 'name type icon color' },
      { path: 'account', select: 'name type institution' },
      { path: 'creditCard', select: 'cardNumber cardBrand cardholderName' },
      { path: 'investment', select: 'name type symbol' } // Adicionar população do investimento
    ])) as unknown as ITransactionPopulated;
  }

  async findById(id: string, userId?: string): Promise<ITransactionPopulated | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    const transaction = await TransactionModel.findOne(query)
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .populate('investment', 'name type symbol'); // Adicionar população do investimento
      
    return transaction as unknown as ITransactionPopulated;
  }

  async findByUser(userId: string, filters: any = {}): Promise<ITransactionPopulated[]> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.account) query.account = filters.account;
    if (filters.investment) query.investment = filters.investment; // Adicionar filtro por investimento
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }
    
    const limit = filters.limit || 10;
    const skip = ((filters.page || 1) - 1) * limit;
    
    const transactions = await TransactionModel.find(query)
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .populate('investment', 'name type symbol') // Adicionar população do investimento
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
      
    return transactions as unknown as ITransactionPopulated[];
  }

  async countByUser(userId: string, filters: any = {}): Promise<number> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.account) query.account = filters.account;
    if (filters.investment) query.investment = filters.investment; // Adicionar filtro por investimento
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }
    
    return await TransactionModel.countDocuments(query);
  }

  async update(id: string, userId: string, data: Partial<ITransaction>, options?: { session?: ClientSession }): Promise<ITransactionPopulated | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const updated = await TransactionModel.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    )
    .populate('category', 'name type icon color')
    .populate('account', 'name type institution')
    .populate('investment', 'name type symbol'); // Adicionar população do investimento
    
    return updated as unknown as ITransactionPopulated;
  }

  async delete(id: string, userId: string, options?: { session?: ClientSession }): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await TransactionModel.deleteOne(
      { _id: id, user: userId },
      options
    );
    
    return result.deletedCount > 0;
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ITransactionPopulated[]> {
    const transactions = await TransactionModel.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('category', 'name type')
      .populate('account', 'name type')
      .populate('investment', 'name type symbol') // Adicionar população do investimento
      .sort({ date: 1 });
      
    return transactions as unknown as ITransactionPopulated[];
  }

  async findByCategory(userId: string, categoryId: string): Promise<ITransactionPopulated[]> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) return [];
    
    const transactions = await TransactionModel.find({
      user: userId,
      category: categoryId,
    })
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .populate('investment', 'name type symbol') // Adicionar população do investimento
      .sort({ date: -1 });
      
    return transactions as unknown as ITransactionPopulated[];
  }

  async findByAccount(userId: string, accountId: string): Promise<ITransactionPopulated[]> {
    if (!mongoose.Types.ObjectId.isValid(accountId)) return [];
    
    const transactions = await TransactionModel.find({
      user: userId,
      account: accountId,
    })
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .populate('investment', 'name type symbol') // Adicionar população do investimento
      .sort({ date: -1 });
      
    return transactions as unknown as ITransactionPopulated[];
  }

  async findByInvestment(userId: string, investmentId: string): Promise<ITransactionPopulated[]> {
    if (!mongoose.Types.ObjectId.isValid(investmentId)) return [];
    
    const transactions = await TransactionModel.find({
      user: userId,
      investment: investmentId,
    })
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .populate('investment', 'name type symbol')
      .sort({ date: -1 });
      
    return transactions as unknown as ITransactionPopulated[];
  }
}