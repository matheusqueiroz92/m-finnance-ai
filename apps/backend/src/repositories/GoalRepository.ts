import { injectable } from 'tsyringe';
import mongoose, { ClientSession } from 'mongoose';
import { GoalModel } from '../schemas/GoalSchema';
import { IGoalRepository } from '../interfaces/repositories/IGoalRepository';
import { IGoal } from '../interfaces/entities/IGoal';

@injectable()
export class GoalRepository implements IGoalRepository {
  async create(data: Partial<IGoal>, options?: { session?: ClientSession }): Promise<IGoal> {
    const goal = new GoalModel(data);
    
    // Calculate progress if both target and current amount are provided
    if (data.targetAmount && data.currentAmount) {
      goal.progress = Math.min(100, (data.currentAmount / data.targetAmount) * 100);
      
      // Set isCompleted based on progress
      goal.isCompleted = goal.progress >= 100;
    }
    
    return await goal.save(options);
  }

  async findById(id: string, userId?: string): Promise<IGoal | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const query: any = { _id: id };
    if (userId) query.user = userId;
    
    return await GoalModel.findOne(query);
  }

  async findByUser(userId: string, isCompleted?: boolean): Promise<IGoal[]> {
    const query: any = { user: userId };
    
    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted;
    }
    
    return await GoalModel.find(query).sort({ targetDate: 1 });
  }

  async update(id: string, userId: string, data: Partial<IGoal>, options?: { session?: ClientSession }): Promise<IGoal | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    // Calculate progress if target amount or current amount is updated
    if (data.targetAmount || data.currentAmount !== undefined) {
      const goal = await this.findById(id, userId);
      
      if (goal) {
        const targetAmount = data.targetAmount || goal.targetAmount;
        const currentAmount = data.currentAmount !== undefined ? data.currentAmount : goal.currentAmount;
        
        data.progress = Math.min(100, (currentAmount / targetAmount) * 100);
        data.isCompleted = data.progress >= 100;
      }
    }
    
    return await GoalModel.findOneAndUpdate(
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
    
    const result = await GoalModel.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
  }

  async calculateProgress(goalId: string, userId: string): Promise<number> {
    const goal = await this.findById(goalId, userId);
    
    if (!goal) {
      throw new Error('Meta não encontrada');
    }
    
    const progress = goal.targetAmount > 0 
      ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
      : 0;
    
    return progress;
  }
}