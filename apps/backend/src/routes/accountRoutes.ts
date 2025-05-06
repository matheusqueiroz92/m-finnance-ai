import express from 'express';
import { AccountController } from '../controllers/AccountController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { accountCreateSchema, accountUpdateSchema } from '../validators/accountValidator';

const router = express.Router();
const accountController = new AccountController();

// Todas as rotas são protegidas
router.use(protect);

router.post('/', validate(accountCreateSchema), accountController.createAccount);
router.get('/', accountController.getAccounts);
router.get('/summary', accountController.getAccountSummary);
router.get('/:id', accountController.getAccountById);
router.put('/:id', validate(accountUpdateSchema), accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

export default router;