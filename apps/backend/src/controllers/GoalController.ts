import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IGoalService } from '../interfaces/services/IGoalService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

@injectable()
export class GoalController {
  constructor(
    @inject('GoalService')
    private goalService: IGoalService
  ) {}
  
  /**
   * Create a new goal
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the goal is created
   */
  createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

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
        name,
        targetAmount,
        currentAmount,
        startDate,
        targetDate,
        category,
        icon,
        notes,
      };
      
      const goal = await this.goalService.createGoal((req.user as any)._id, goalData);
      
      ApiResponse.created(res, goal, 'Meta criada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get goals for the authenticated user
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the goals are retrieved
   */
  getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const isCompleted = req.query.isCompleted !== undefined
        ? req.query.isCompleted === 'true'
        : undefined;
      
      const goals = await this.goalService.getGoalsByUserId((req.user as any)._id, isCompleted);
      
      ApiResponse.success(res, goals, 'Metas recuperadas com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get goal by ID
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the goal is retrieved
   */
  getGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID da meta é obrigatório', 400);
      }
      
      const goal = await this.goalService.getGoalById(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, goal, 'Meta recuperada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Update a goal
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the goal is updated
   */
  updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID da meta é obrigatório', 400);
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
      
      const updateData = {
        name,
        targetAmount,
        currentAmount,
        targetDate,
        category,
        icon,
        notes,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const goal = await this.goalService.updateGoal(
        req.params.id,
        (req.user as any)._id,
        updateData
      );
      
      ApiResponse.success(res, goal, 'Meta atualizada com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Delete a goal
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the goal is deleted
   */
  deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      if (!req.params.id) {
        throw new ApiError('ID da meta é obrigatório', 400);
      }
      
      await this.goalService.deleteGoal(
        req.params.id,
        (req.user as any)._id
      );
      
      ApiResponse.success(res, { success: true }, 'Meta excluída com sucesso');
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get goal statistics
   * @param req - The request object
   * @param res - The response object
   * @param next - The next function
   * @returns A promise that resolves when the goal statistics are retrieved
   */
  getGoalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        ApiResponse.error(res, 'Usuário não autenticado', 401);
        return;
      }

      try {
      const stats = await this.goalService.getGoalStats((req.user as any)._id);
      
      ApiResponse.success(res, stats, 'Estatísticas de metas recuperadas com sucesso');
    } catch (error) {
      next(error);
    }
  };
}