import express from "express";
import { validateToken } from "../middlewares/authorization.js";
import { createGoal, updateGoal, deleteGoal, getGoal, getGoals } from "../controllers/goalTracking.controller.js";

const router = express.Router();

router.post("/", validateToken, createGoal);
router.put("/:id", validateToken, updateGoal);
router.delete("/:id", validateToken, deleteGoal);
router.get("/:id", validateToken, getGoal);
router.get("/", validateToken, getGoals);

export default router;