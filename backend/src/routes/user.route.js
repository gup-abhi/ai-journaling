import express from "express";
import { getStreakData, populateJournalingDays } from "../controllers/user.controller.js";
import { validateToken } from "../middlewares/authorization.js";

const router = express.Router();

router.get("/streak", validateToken, getStreakData);
router.post("/populate-journaling-days", validateToken, populateJournalingDays);

export default router;
