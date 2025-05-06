import express from 'express';
import { container } from '../config/container';
import { GoalController } from '../controllers/GoalController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { goalCreateSchema, goalUpdateSchema } from '../validators/goalValidator';

const router = express.Router();
const goalController = container.resolve(GoalController);

// Todas as rotas são protegidas
router.use(protect);

router.post('/', validate(goalCreateSchema), goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/stats', goalController.getGoalStats);
router.get('/:id', goalController.getGoalById);
router.put('/:id', validate(goalUpdateSchema), goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

export default router;