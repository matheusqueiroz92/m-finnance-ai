import express from "express";
import { container } from "../config/container";
import { ConsultantController } from "../controllers/ConsultantController";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { consultantChatSchema } from "../validators/consultantValidator";

const router = express.Router();
const consultantController = container.resolve(ConsultantController);

router.use(protect);

router.post("/chat", validate(consultantChatSchema), consultantController.chat);

export default router;
