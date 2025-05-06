import { ApiError } from '../utils/ApiError';
import { GoalModelClass } from '../models/GoalModel';
import { GoalCreateInput, GoalUpdateInput } from '../validators/goalValidator';
import mongoose from 'mongoose';

export class GoalService {
  private goalModel: GoalModelClass;

  constructor() {
    this.goalModel = new GoalModelClass();
  }

  /**
   * Create a new goal
   */
  async createGoal(userId: string, goalData: GoalCreateInput): Promise<any> {
    // Create goal with user ID
    const newGoal = await this.goalModel.create({
      ...goalData,
      user: new mongoose.Types.ObjectId(userId)
    });
    
    return newGoal;
  }
  
  /**
   * Get goals by user ID
   */
  async getGoalsByUserId(userId: string, isCompleted?: boolean): Promise<any[]> {
    const goals = await this.goalModel.findByUser(userId, isCompleted);
    return goals;
  }
  
  /**
   * Get goal by ID
   */
  async getGoalById(goalId: string, userId: string): Promise<any> {
    const goal = await this.goalModel.findById(goalId, userId);
    
    if (!goal) {
      throw new ApiError('Meta não encontrada', 404);
    }
    
    return goal;
  }
  
  /**
   * Update a goal
   */
  async updateGoal(goalId: string, userId: string, updateData: GoalUpdateInput): Promise<any> {
    const updatedGoal = await this.goalModel.update(goalId, userId, updateData);
    
    if (!updatedGoal) {
      throw new ApiError('Meta não encontrada', 404);
    }
    
    return updatedGoal;
  }
  
  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const result = await this.goalModel.delete(goalId, userId);
    
    if (!result) {
      throw new ApiError('Meta não encontrada', 404);
    }
  }
  
  /**
   * Get goal progress statistics
   */
  async getGoalStats(userId: string): Promise<any> {
    const goals = await this.goalModel.findByUser(userId);
    
    let totalGoals = goals.length;
    let completedGoals = 0;
    let inProgressGoals = 0;
    let totalTargetAmount = 0;
    let totalCurrentAmount = 0;
    
    goals.forEach(goal => {
      if (goal.isCompleted) {
        completedGoals++;
      } else {
        inProgressGoals++;
      }
      
      totalTargetAmount += goal.targetAmount;
      totalCurrentAmount += goal.currentAmount;
    });
    
    const overallProgress = totalTargetAmount > 0 
      ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100)
      : 0;
    
    // Get next goals (closest to target date)
    const upcomingGoals = await this.goalModel.findByUser(userId, false);
    upcomingGoals.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
    const nextGoals = upcomingGoals.slice(0, 3);
    
    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
      nextGoals,
    };
  }
}