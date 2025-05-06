import mongoose, { Document, Schema } from 'mongoose';
import { IGoal, IGoalModel } from '../interfaces/IGoal';

class GoalModelClass implements IGoalModel {
  async create(goalData: Partial<IGoal>): Promise<IGoal> {
    const goal = new GoalModel(goalData);
    
    // Calculate progress if both target and current amount are provided
    if (goalData.targetAmount && goalData.currentAmount) {
      goal.progress = Math.min(100, (goalData.currentAmount / goalData.targetAmount) * 100);
      
      // Set isCompleted based on progress
      goal.isCompleted = goal.progress >= 100;
    }
    
    return await goal.save();
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

  async update(id: string, userId: string, updateData: Partial<IGoal>): Promise<IGoal | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    // Calculate progress if target amount or current amount is updated
    if (updateData.targetAmount || updateData.currentAmount !== undefined) {
      const goal = await this.findById(id, userId);
      
      if (goal) {
        const targetAmount = updateData.targetAmount || goal.targetAmount;
        const currentAmount = updateData.currentAmount !== undefined ? updateData.currentAmount : goal.currentAmount;
        
        updateData.progress = Math.min(100, (currentAmount / targetAmount) * 100);
        updateData.isCompleted = updateData.progress >= 100;
      }
    }
    
    return await GoalModel.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true }
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

export { GoalModel as Goal, GoalModelClass };