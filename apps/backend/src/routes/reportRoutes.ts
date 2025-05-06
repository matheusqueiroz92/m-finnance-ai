import express from 'express';
import { ReportController } from '../controllers/ReportController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();
const reportController = new ReportController();

// All routes are protected
router.use(protect);

router.get('/generate', reportController.generateReport);
router.get('/insights', reportController.getInsights);

export default router;