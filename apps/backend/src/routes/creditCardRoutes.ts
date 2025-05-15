import express from 'express';
import { container } from '../config/container';
import { CreditCardController } from '../controllers/CreditCardController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { 
  creditCardCreateSchema, 
  creditCardUpdateSchema,
  validateSecurityCodeSchema 
} from '../validators/creditCardValidator';

const router = express.Router();
const creditCardController = container.resolve(CreditCardController);

// Todas as rotas são protegidas
router.use(protect);

router.post('/', validate(creditCardCreateSchema), creditCardController.createCreditCard);
router.get('/', creditCardController.getCreditCards);
router.get('/:id', creditCardController.getCreditCardById);
router.get('/:id/balance', creditCardController.getCreditCardBalance);
router.put('/:id', validate(creditCardUpdateSchema), creditCardController.updateCreditCard);
router.delete('/:id', creditCardController.deleteCreditCard);
router.post('/:id/validate-security-code', validate(validateSecurityCodeSchema), creditCardController.validateSecurityCode);

export default router;