import Insight from "../models/Insights.model.js";
import { generateInsights } from "../util/generateInsights.js"

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
    console.log("AI Insight stored successfully:");
  } catch (error) {
    console.error("Error storing AI Insight:", error);
  }
};

export default storeAiInsight;
