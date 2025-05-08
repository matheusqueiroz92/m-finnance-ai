import express from 'express';
import { container } from '../config/container';
import { TransactionController } from '../controllers/TransactionController';
import { protect } from '../middlewares/authMiddleware';
import { validate, validateQueryParams } from '../middlewares/validationMiddleware';
import { upload } from '../config/multer';
// import { transactionCreateSchema, transactionUpdateSchema, transactionFilterSchema } from '../validators/transactionValidator';

const router = express.Router();
const transactionController = container.resolve(TransactionController);

// Todas as rotas são protegidas
router.use(protect);

router.post('/', upload.array('attachments', 5), transactionController.createTransaction);
router.get('/', transactionController.getUserTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', upload.array('attachments', 5), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.delete('/:transactionId/attachments/:attachmentId', transactionController.removeAttachment);

export default router;