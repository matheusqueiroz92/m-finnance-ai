import express from 'express';
import { container } from '../config/container';
import { InvestmentController } from '../controllers/InvestmentController';
import { protect } from '../middlewares/authMiddleware';
import { validate, validateQueryParams } from '../middlewares/validationMiddleware';
import { investmentCreateSchema, investmentUpdateSchema, investmentFilterSchema } from '../validators/investmentValidator';

const router = express.Router();
const investmentController = container.resolve(InvestmentController);

// Todas as rotas são protegidas
router.use(protect);

router.post('/', validate(investmentCreateSchema), investmentController.createInvestment);
router.get('/', validateQueryParams(investmentFilterSchema), investmentController.getInvestments);
router.get('/summary', investmentController.getInvestmentSummary);
router.get('/account/:accountId', investmentController.getInvestmentsByAccount);
router.get('/:id', investmentController.getInvestmentById);
router.get('/:id/transactions', investmentController.getTransactionsByInvestment); 
router.put('/:id', validate(investmentUpdateSchema), investmentController.updateInvestment);
router.delete('/:id', investmentController.deleteInvestment);

export default router;