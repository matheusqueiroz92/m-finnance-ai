import express from 'express';
import { container } from '../config/container';
import { TransactionController } from '../controllers/TransactionController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = express.Router();
const transactionController = container.resolve(TransactionController);

router.use(protect);

router.post('/', upload.array('attachments', 5), transactionController.createTransaction);
router.get('/', transactionController.getUserTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', upload.array('attachments', 5), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.delete('/:transactionId/attachments/:attachmentId', transactionController.removeAttachment);

export default router;