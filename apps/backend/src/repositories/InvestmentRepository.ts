import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { InvestmentModel } from '../schemas/InvestmentSchema';
import { IInvestmentRepository } from '../interfaces/repositories/IInvestmentRepository';
import { IInvestment, InvestmentType } from '../interfaces/entities/IInvestment';

@injectable()
export class InvestmentRepository implements IInvestmentRepository {
  async create(data: Partial<IInvestment>, options?: { session?: ClientSession }): Promise<IInvestment> {
    const investment = new InvestmentModel(data);
    return await investment.save(options);
  }

  async findById(id: string, userId?: string): Promise<IInvestment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    return await InvestmentModel.findOne(query)
      .populate('account', 'name type institution');
  }

  async findByUser(userId: string, filters: { type?: InvestmentType; isActive?: boolean; account?: string } = {}): Promise<IInvestment[]> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.account) query.account = filters.account;
    
    return await InvestmentModel.find(query)
      .populate('account', 'name type institution')
      .sort({ acquisitionDate: -1 });
  }

  async countByUser(userId: string, filters: { type?: InvestmentType; isActive?: boolean; account?: string } = {}): Promise<number> {
    const query: any = { user: userId };
    
    if (filters.type) query.type = filters.type;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.account) query.account = filters.account;
    
    return await InvestmentModel.countDocuments(query);
  }

  async update(id: string, userId: string, data: Partial<IInvestment>, options?: { session?: ClientSession }): Promise<IInvestment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    // Se o valor atual foi atualizado, recalcule o desempenho
    if (data.currentValue !== undefined) {
      const investment = await InvestmentModel.findOne({ _id: id, user: userId });
      
      if (investment) {
        const newData: any = { ...data };
        
        // Calcular novos valores de performance
        const absoluteReturn = data.currentValue - investment.initialValue;
        const percentageReturn = investment.initialValue > 0 
          ? ((data.currentValue - investment.initialValue) / investment.initialValue) * 100 
          : 0;
        
        newData.performance = {
          absoluteReturn,
          percentageReturn
        };
        
        // Cálculo do retorno anualizado
        if (investment.acquisitionDate) {
          const now = new Date();
          const acquisitionDate = new Date(investment.acquisitionDate);
          const yearDiff = (now.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          
          if (yearDiff > 0) {
            const r = data.currentValue / investment.initialValue;
            newData.performance.annualizedReturn = (Math.pow(r, 1 / yearDiff) - 1) * 100;
          }
        }
        
        data = newData;
      }
    }
    
    return await InvestmentModel.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    ).populate('account', 'name type institution');
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    
    const result = await InvestmentModel.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
  }

  async getInvestmentsByAccount(userId: string, accountId: string): Promise<IInvestment[]> {
    if (!mongoose.Types.ObjectId.isValid(accountId)) return [];
    
    return await InvestmentModel.find({
      user: userId,
      account: accountId
    }).populate('account', 'name type institution');
  }
}