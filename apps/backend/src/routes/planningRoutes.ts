import express from "express";
import { container } from "../config/container";
import { PlanningController } from "../controllers/PlanningController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();
const planningController = container.resolve(PlanningController);

router.use(protect);

router.get("/plan", planningController.getPlan);
router.get("/simulate", planningController.simulateScenario);
router.get("/adherence", planningController.getAdherence);

export default router;
