import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { getSentimentTrends, getSentimentTrendsByPeriod, getSentimentTrendsById, getOverallSentiment } from '../controllers/aiinsight.controller.js';

const router = express.Router();

router.get("/sentiment-trends", validateToken, getSentimentTrends);
router.get("/sentiment-trends/overall", validateToken, getOverallSentiment);
router.get("/sentiment-trends/:id", validateToken, getSentimentTrendsById);
router.get("/sentiment-trends/period/:period", validateToken, getSentimentTrendsByPeriod);

export default router;