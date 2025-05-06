import { ClientSession } from 'mongoose';
import { IGoal } from '../entities/IGoal';

export interface IGoalRepository {
  create(data: Partial<IGoal>, options?: { session?: ClientSession }): Promise<IGoal>;
  findById(id: string, userId?: string): Promise<IGoal | null>;
  findByUser(userId: string, isCompleted?: boolean): Promise<IGoal[]>;
  update(id: string, userId: string, data: Partial<IGoal>, options?: { session?: ClientSession }): Promise<IGoal | null>;
  delete(id: string, userId: string): Promise<boolean>;
  calculateProgress(goalId: string, userId: string): Promise<number>;
}