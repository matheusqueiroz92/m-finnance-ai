import express from 'express';
import { container } from '../config/container';
import { CategoryController } from '../controllers/CategoryController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { categoryCreateSchema, categoryUpdateSchema } from '../validators/categoryValidator';

const router = express.Router();
const categoryController = container.resolve(CategoryController);

// Todas as rotas são protegidas
router.use(protect);

router.post('/', validate(categoryCreateSchema), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', validate(categoryUpdateSchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;