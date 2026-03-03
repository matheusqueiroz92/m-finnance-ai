import express from "express";
import { container } from "../config/container";
import { ConsultantController } from "../controllers/ConsultantController";
import { protect } from "../middlewares/authMiddleware";
import { validate, validateParams } from "../middlewares/validationMiddleware";
import {
  consultantChatSchema,
  consultantSessionIdParamSchema,
} from "../validators/consultantValidator";

const router = express.Router();
const consultantController = container.resolve(ConsultantController);

router.use(protect);

router.post("/sessions", consultantController.createSession);
router.get("/sessions", consultantController.getSessions);
router.get(
  "/sessions/:id",
  validateParams(consultantSessionIdParamSchema),
  consultantController.getSessionById
);
router.post("/chat", validate(consultantChatSchema), consultantController.chat);

export default router;
