import express from "express";
import { getStreakData } from "../controllers/user.controller.js";
import { validateToken } from "../middlewares/authorization.js";

const router = express.Router();

router.get("/streak", validateToken, getStreakData);

export default router;
