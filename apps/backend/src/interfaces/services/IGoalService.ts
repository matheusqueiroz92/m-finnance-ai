import { 
    IGoalCreateDTO, 
    IGoalUpdateDTO, 
    IGoalDTO,
    IGoalStats
  } from '../entities/IGoal';
  
  export interface IGoalService {
    createGoal(userId: string, goalData: IGoalCreateDTO): Promise<IGoalDTO>;
    getGoalsByUserId(userId: string, isCompleted?: boolean): Promise<IGoalDTO[]>;
    getGoalById(goalId: string, userId: string): Promise<IGoalDTO>;
    updateGoal(goalId: string, userId: string, updateData: IGoalUpdateDTO): Promise<IGoalDTO>;
    deleteGoal(goalId: string, userId: string): Promise<void>;
    getGoalStats(userId: string): Promise<IGoalStats>;
  }