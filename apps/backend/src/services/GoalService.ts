import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IGoalService } from '../interfaces/services/IGoalService';
import { IGoalRepository } from '../interfaces/repositories/IGoalRepository';
import { INotificationService } from '../interfaces/services/INotificationService';
import { 
  IGoalCreateDTO, 
  IGoalUpdateDTO, 
  IGoalDTO,
  IGoalStats,
  IGoal
} from '../interfaces/entities/IGoal';
import { ApiError } from '../utils/ApiError';
import { TransactionManager } from '../utils/TransactionManager';

@injectable()
export class GoalService implements IGoalService {
  constructor(
    @inject('GoalRepository')
    private goalRepository: IGoalRepository,
    @inject('NotificationService')
    private notificationService: INotificationService
  ) {}

  /**
   * Create a new goal
   */
  async createGoal(userId: string, goalData: IGoalCreateDTO): Promise<IGoalDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Process dates if they are strings
      const processedData: any = { ...goalData };
      if (typeof processedData.startDate === 'string') {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (typeof processedData.targetDate === 'string') {
        processedData.targetDate = new Date(processedData.targetDate);
      }
      
      // Create goal with user ID
      const newGoal = {
        ...processedData,
        user: new mongoose.Types.ObjectId(userId),
        currentAmount: processedData.currentAmount || 0,
        startDate: processedData.startDate || new Date(),
        isCompleted: false,
        progress: 0
      };
      
      // Calculate initial progress
      if (newGoal.targetAmount > 0) {
        newGoal.progress = Math.min(100, (newGoal.currentAmount / newGoal.targetAmount) * 100);
        newGoal.isCompleted = newGoal.progress >= 100;
      }
      
      const goal = await this.goalRepository.create(newGoal, { session });
      
      return this.mapToDTO(goal);
    });
  }
  
  /**
   * Get goals by user ID
   */
  async getGoalsByUserId(userId: string, isCompleted?: boolean): Promise<IGoalDTO[]> {
    const goals = await this.goalRepository.findByUser(userId, isCompleted);
    return goals.map(goal => this.mapToDTO(goal));
  }
  
  /**
   * Get goal by ID
   */
  async getGoalById(goalId: string, userId: string): Promise<IGoalDTO> {
    const goal = await this.goalRepository.findById(goalId, userId);
    
    if (!goal) {
      throw new ApiError('Meta não encontrada', 404);
    }
    
    return this.mapToDTO(goal);
  }
  
  /**
   * Update a goal
   */
  async updateGoal(goalId: string, userId: string, updateData: IGoalUpdateDTO): Promise<IGoalDTO> {
    return TransactionManager.executeInTransaction(async (session) => {
      // Process date if it's a string
      const processedData: any = { ...updateData };
      if (typeof processedData.targetDate === 'string') {
        processedData.targetDate = new Date(processedData.targetDate);
      }
      
      // Get the current goal to check if it will be completed
      const currentGoal = await this.goalRepository.findById(goalId, userId);
      if (!currentGoal) {
        throw new ApiError('Meta não encontrada', 404);
      }
      
      // Update the goal
      const updatedGoal = await this.goalRepository.update(goalId, userId, processedData, { session });
      
      if (!updatedGoal) {
        throw new ApiError('Falha ao atualizar meta', 500);
      }
      
      // Send notification if goal is now completed but wasn't before
      if (updatedGoal.isCompleted && !currentGoal.isCompleted) {
        try {
          // Get the user to pass to notification service
          // For this we would need a UserRepository, but for simplicity we'll skip this step
          // In a real implementation, inject UserRepository and get the user data here
          
          await this.notificationService.sendGoalAchievedNotification(
            { _id: userId } as any, // This is not ideal, but a workaround for now
            { 
              name: updatedGoal.name, 
              targetAmount: updatedGoal.targetAmount 
            }
          );
        } catch (error) {
          console.error('Failed to send goal completion notification:', error);
          // Continue even if notification fails
        }
      }
      
      return this.mapToDTO(updatedGoal);
    });
  }
  
  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const result = await this.goalRepository.delete(goalId, userId);
    
    if (!result) {
      throw new ApiError('Meta não encontrada', 404);
    }
  }
  
  /**
   * Get goal progress statistics
   */
  async getGoalStats(userId: string): Promise<IGoalStats> {
    const goals = await this.goalRepository.findByUser(userId);
    
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
    const upcomingGoals = await this.goalRepository.findByUser(userId, false);
    upcomingGoals.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
    const nextGoals = upcomingGoals.slice(0, 3).map(goal => this.mapToDTO(goal));
    
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
  
  /**
   * Map Goal model to DTO
   */
  private mapToDTO(goal: IGoal): IGoalDTO {
    // Ensure _id exists and convert to string
    const id = goal._id?.toString() || '';
    
    return {
      _id: id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      category: goal.category,
      icon: goal.icon,
      notes: goal.notes,
      isCompleted: goal.isCompleted,
      progress: goal.progress,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    };
  }
}