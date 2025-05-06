import express from 'express';
import { container } from '../config/container';
import { UserController } from '../controllers/UserController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { userRegisterSchema, userLoginSchema, userUpdateSchema, changePasswordSchema } from '../validators/userValidator';
import upload from '../config/multer';

const router = express.Router();
const userController = container.resolve(UserController);

// Rotas públicas
router.post('/register', validate(userRegisterSchema), userController.register);
router.post('/login', validate(userLoginSchema), userController.login);

// Rotas protegidas
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, validate(userUpdateSchema), upload.single('avatar'), userController.updateProfile);
router.post('/change-password', protect, validate(changePasswordSchema), userController.changePassword);

export default router;