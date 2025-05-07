import express from 'express';
import { container } from '../config/container';
import { UserController } from '../controllers/UserController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { userRegisterSchema, userLoginSchema, userUpdateSchema, changePasswordSchema } from '../validators/userValidator';
import upload, { avatarUpload } from '../config/multer';

const router = express.Router();
const userController = container.resolve(UserController);

// Rotas públicas
router.post('/register', avatarUpload.single('avatar'), validate(userRegisterSchema), userController.register);
router.post('/login', validate(userLoginSchema), userController.login);
router.post('/verify-email', userController.verifyEmail);

// Rotas protegidas
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, avatarUpload.single('avatar'), validate(userUpdateSchema), upload.single('avatar'), userController.updateProfile);
router.post('/change-password', protect, validate(changePasswordSchema), userController.changePassword);
router.post('/resend-verification', protect, userController.resendVerificationEmail);

export default router;