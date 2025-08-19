import AiInsight from "../models/AiInsights.model.js";
import analyzeSentiment from '../util/sentimentAnalysis.js';

const storeAiInsight = async (req, res, data) => {
    const { user_id, journal_entry_id, content, processed_at } = data;
  try {
    const { sentiment_label, sentiment_score } = await analyzeSentiment(content);

    const aiInsight = new AiInsight({
      user_id,
      journal_entry_id,
      sentiment_label,
      sentiment_score,
      processed_at
    });

    await aiInsight.save();
    console.log("AI Insight stored successfully:");
  } catch (error) {
    console.error("Error storing AI Insight:", error);
  }
};

export default storeAiInsight;
