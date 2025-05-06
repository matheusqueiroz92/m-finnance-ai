import express from 'express';
import { container } from '../config/container';
import { TransactionController } from '../controllers/TransactionController';
import { protect } from '../middlewares/authMiddleware';
import { validate, validateQueryParams } from '../middlewares/validationMiddleware';
import { transactionCreateSchema, transactionUpdateSchema, transactionFilterSchema } from '../validators/transactionValidator';
import upload from '../config/multer';

const router = express.Router();
const transactionController = container.resolve(TransactionController);

// Todas as rotas são protegidas
router.use(protect);

router.post('/', validate(transactionCreateSchema), upload.array('attachments', 5), transactionController.createTransaction);
router.get('/', validateQueryParams(transactionFilterSchema), transactionController.getUserTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', validate(transactionUpdateSchema), upload.array('attachments', 5), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;