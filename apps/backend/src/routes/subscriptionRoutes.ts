import express from 'express';
import { container } from '../config/container';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();
const subscriptionController = container.resolve(SubscriptionController);

// Todas as rotas são protegidas
router.use(protect);

router.get('/', subscriptionController.getCurrentSubscription);
router.post('/trial', subscriptionController.startTrial);
router.post('/cancel', subscriptionController.cancelSubscription);
router.put('/plan', subscriptionController.updateSubscriptionPlan);

export default router;