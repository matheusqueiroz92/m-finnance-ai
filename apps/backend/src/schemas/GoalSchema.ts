import mongoose, { Schema, model } from 'mongoose';
import { IGoal, IGoalModel } from '../interfaces/IGoal';

const goalSchema = new Schema<IGoal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nome da meta é obrigatório'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Valor alvo é obrigatório'],
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: [true, 'Data alvo é obrigatória'],
    },
    category: {
      type: String,
    },
    icon: {
      type: String,
    },
    notes: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate progress on save
goalSchema.pre('save', function (next) {
  if (this.targetAmount > 0) {
    this.progress = Math.min(100, (this.currentAmount / this.targetAmount) * 100);
  }
  
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true;
  }
  
  next();
});

// Criar modelo
const GoalModel = model<IGoal>('Goal', goalSchema);