import Insight from "../models/Insights.model.js";
import { generateInsights } from "../util/generateInsights.js"
import logger from '../lib/logger.js';
import updateGoalsFromInsights from './updateGoalsFromInsights.js';

const storeAiInsight = async (req, res, data) => {
  const { user_id, journal_entry_id, content, processed_at } = data;
  try {
    const insightData = await generateInsights(content);

    const insight = new Insight({
      user_id,
      journal_entry_id,
      ...insightData,
      processed_at
    });

    await insight.save();
    logger.info(`"AI Insight stored successfully for journal entry ID: ${insight.journal_entry_id}`);

    if (insightData.goals_aspirations) {
      await updateGoalsFromInsights(user_id, insightData.goals_aspirations);
    }
  } catch (error) {
    logger.error(`Error storing AI Insight: ${error}`);
  }
};

export default storeAiInsight;
