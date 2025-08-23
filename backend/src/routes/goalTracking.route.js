import express from "express";
import { validateToken } from "../middlewares/authorization.js";
import { createGoal, updateGoal, deleteGoal, getGoal, getGoals, getActiveGoals, getGoalByProgress } from "../controllers/goalTracking.controller.js";

const router = express.Router();

router.post("/", validateToken, createGoal);
router.get("/active-goals", validateToken, getActiveGoals);
router.get("/", validateToken, getGoals);
router.put("/:id", validateToken, updateGoal);
router.delete("/:id", validateToken, deleteGoal);
router.get("/:id", validateToken, getGoal);
router.get("/progress/:progress", validateToken, getGoalByProgress);

export default router;