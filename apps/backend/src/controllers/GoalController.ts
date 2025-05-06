import { Request, Response, NextFunction } from 'express';
import { GoalService } from '../services/GoalService';

export class GoalController {
  private goalService: GoalService;
  
  constructor() {
    this.goalService = new GoalService();
  }
  
  /**
   * Create a new goal
   */
  createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        name,
        targetAmount,
        currentAmount,
        startDate,
        targetDate,
        category,
        icon,
        notes,
      } = req.body;
      
      const goalData = {
        user: req.user._id,
        name,
        targetAmount,
        currentAmount: currentAmount || 0,
        startDate: startDate || new Date(),
        targetDate,
        category,
        icon,
        notes,
      };
      
      const goal = await this.goalService.createGoal(req.user._id, goalData);
      
      res.status(201).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get goals for the authenticated user
   */
  getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isCompleted = req.query.isCompleted !== undefined
        ? req.query.isCompleted === 'true'
        : undefined;
      
      const goals = await this.goalService.getGoalsByUserId(req.user._id, isCompleted);
      
      res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get goal by ID
   */
  getGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new Error('Goal ID is required');
      }
      
      const goal = await this.goalService.getGoalById(
        req.params.id,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a goal
   */
  updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new Error('Goal ID is required');
      }
      
      const {
        name,
        targetAmount,
        currentAmount,
        targetDate,
        category,
        icon,
        notes,
      } = req.body;
      
      const updateData: Record<string, any> = {
        name,
        targetAmount,
        currentAmount,
        targetDate,
        category,
        icon,
        notes,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );
      
      const goal = await this.goalService.updateGoal(
        req.params.id,
        req.user._id,
        updateData
      );
      
      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a goal
   */
  deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.id) {
        throw new Error('Goal ID is required');
      }
      
      const result = await this.goalService.deleteGoal(
        req.params.id,
        req.user._id
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get goal statistics
   */
  getGoalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.goalService.getGoalStats(req.user._id);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}