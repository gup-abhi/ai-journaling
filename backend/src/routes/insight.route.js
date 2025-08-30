import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { getSentimentTrends, getSentimentTrendsByPeriod, getTrendsByJournalId, getOverallSentiment, getKeyThemesByPeriod, getEmotionDistribution, getEmotionIntensityHeatmap, getThematicSentiment } from '../controllers/insight.controller.js';

const router = express.Router();

router.get("/trends", validateToken, getSentimentTrends);
router.get("/trends/overall", validateToken, getOverallSentiment);
router.get("/trends/journal/:journal_id", validateToken, getTrendsByJournalId);
router.get("/trends/sentiment/period/:period", validateToken, getSentimentTrendsByPeriod);
router.get("/trends/keyThemes/period/:period", validateToken, getKeyThemesByPeriod);
router.get("/emotion-distribution/period/:period", validateToken, getEmotionDistribution);
router.get("/emotion-intensity-heatmap/period/:period", validateToken, getEmotionIntensityHeatmap);
router.get("/thematic-sentiment/period/:period", validateToken, getThematicSentiment);

export default router;