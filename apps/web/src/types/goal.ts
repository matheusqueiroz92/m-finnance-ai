export interface Goal {
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

export interface GoalCreateData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  startDate?: string;
  targetDate: string;
  category?: string;
  icon?: string;
  notes?: string;
}

export interface GoalUpdateData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  category?: string;
  icon?: string;
  notes?: string;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
  nextGoals: Goal[];
}