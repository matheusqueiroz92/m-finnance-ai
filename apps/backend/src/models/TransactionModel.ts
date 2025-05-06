import mongoose, { Document, Schema } from 'mongoose';
import { ITransaction, ITransactionModel } from '../interfaces/ITransaction';

class TransactionModelClass implements ITransactionModel {
  async create(transactionData: Partial<ITransaction>): Promise<ITransaction> {
    const transaction = new TransactionModel(transactionData);
    return await transaction.save();
  }

  async findById(id: string, userId?: string): Promise<ITransaction | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    return await TransactionModel.findOne(query)
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution');
  }

  async findByUser(userId: string, filters: any = {}): Promise<ITransaction[]> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.account) query.account = filters.account;
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }
    
    const limit = filters.limit || 10;
    const skip = ((filters.page || 1) - 1) * limit;
    
    return await TransactionModel.find(query)
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
  }

  async countByUser(userId: string, filters: any = {}): Promise<number> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.account) query.account = filters.account;
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }
    
    return await TransactionModel.countDocuments(query);
  }

  async update(id: string, userId: string, updateData: Partial<ITransaction>): Promise<ITransaction | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await TransactionModel.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('category', 'name type icon color')
    .populate('account', 'name type institution');
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await TransactionModel.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ITransaction[]> {
    return await TransactionModel.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('category', 'name type')
      .populate('account', 'name type')
      .sort({ date: 1 });
  }

  async findByCategory(userId: string, categoryId: string): Promise<ITransaction[]> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) return [];
    
    return await TransactionModel.find({
      user: userId,
      category: categoryId,
    })
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .sort({ date: -1 });
  }

  async findByAccount(userId: string, accountId: string): Promise<ITransaction[]> {
    if (!mongoose.Types.ObjectId.isValid(accountId)) return [];
    
    return await TransactionModel.find({
      user: userId,
      account: accountId,
    })
      .populate('category', 'name type icon color')
      .populate('account', 'name type institution')
      .sort({ date: -1 });
  }
}

export { TransactionModel as Transaction, TransactionModelClass };