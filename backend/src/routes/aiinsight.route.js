import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { getSentimentTrends, getSentimentTrendsByPeriod, getSentimentTrendsByJournalId, getOverallSentiment } from '../controllers/aiinsight.controller.js';

const router = express.Router();

router.get("/sentiment-trends", validateToken, getSentimentTrends);
router.get("/sentiment-trends/overall", validateToken, getOverallSentiment);
router.get("/sentiment-trends/journal/:journal_id", validateToken, getSentimentTrendsByJournalId);
router.get("/sentiment-trends/period/:period", validateToken, getSentimentTrendsByPeriod);

export default router;