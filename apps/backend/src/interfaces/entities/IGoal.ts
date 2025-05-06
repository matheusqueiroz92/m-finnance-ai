import { Document, Types } from 'mongoose';

export interface IGoal extends Document {
  user: Types.ObjectId;
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

export interface IGoalDTO {
  _id: string;
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

export interface IGoalCreateDTO {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  startDate?: Date | string;
  targetDate: Date | string;
  category?: string;
  icon?: string;
  notes?: string;
}

export interface IGoalUpdateDTO {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: Date | string;
  category?: string;
  icon?: string;
  notes?: string;
}

export interface IGoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
  nextGoals: IGoalDTO[];
}