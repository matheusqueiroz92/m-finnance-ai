import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { CreditCardModel } from '../schemas/CreditCardSchema';
import { ICreditCardRepository } from '../interfaces/repositories/ICreditCardRepository';
import { ICreditCard } from '../interfaces/entities/ICreditCard';

@injectable()
export class CreditCardRepository implements ICreditCardRepository {
  async create(data: Partial<ICreditCard>, options?: { session?: ClientSession }): Promise<ICreditCard> {
    const creditCard = new CreditCardModel(data);
    return await creditCard.save(options);
  }

  async findById(id: string, userId?: string): Promise<ICreditCard | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    return await CreditCardModel.findOne(query);
  }

  async findByUser(userId: string, isActive?: boolean): Promise<ICreditCard[]> {
    const query: any = { user: userId };
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    return await CreditCardModel.find(query).sort({ createdAt: -1 });
  }

  async findByCardNumber(userId: string, cardNumber: string): Promise<ICreditCard | null> {
    return await CreditCardModel.findOne({
      user: userId,
      cardNumber: cardNumber.slice(-4) // Buscar pelos últimos 4 dígitos
    });
  }

  async update(id: string, userId: string, data: Partial<ICreditCard>, options?: { session?: ClientSession }): Promise<ICreditCard | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await CreditCardModel.findOneAndUpdate(
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
    
    const result = await CreditCardModel.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
  }

  async updateBalance(id: string, userId: string, amount: number, options?: { session?: ClientSession }): Promise<ICreditCard | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await CreditCardModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $inc: { currentBalance: amount } },
      { 
        new: true, 
        runValidators: true,
        ...options 
      }
    );
  }
}