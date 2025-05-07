import express from 'express';
import { container } from '../config/container';
import { PaymentController } from '../controllers/PaymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();
const paymentController = container.resolve(PaymentController);

// Webhook endpoint (não protegido)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Rotas protegidas
router.use(protect);
router.post('/checkout', paymentController.createCheckoutSession);
router.get('/methods', paymentController.getPaymentMethods);

export default router;