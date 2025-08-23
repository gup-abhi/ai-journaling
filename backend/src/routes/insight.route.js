import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { getSentimentTrends, getSentimentTrendsByPeriod, getSentimentTrendsByJournalId, getOverallSentiment } from '../controllers/insight.controller.js';

const router = express.Router();

router.get("/trends", validateToken, getSentimentTrends);
router.get("/trends/overall", validateToken, getOverallSentiment);
router.get("/trends/journal/:journal_id", validateToken, getSentimentTrendsByJournalId);
router.get("/trends/sentiment/period/:period", validateToken, getSentimentTrendsByPeriod);

export default router;