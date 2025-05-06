import mongoose, { Document } from 'mongoose';

export interface IGoal extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  category?: string;
  icon?: string;
  notes?: string;
  isCompleted: boolean;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoalModel {
  create(goalData: Partial<IGoal>): Promise<IGoal>;
  findById(id: string, userId?: string): Promise<IGoal | null>;
  findByUser(userId: string, isCompleted?: boolean): Promise<IGoal[]>;
  update(id: string, userId: string, updateData: Partial<IGoal>): Promise<IGoal | null>;
  delete(id: string, userId: string): Promise<boolean>;
  calculateProgress(goalId: string, userId: string): Promise<number>;
}