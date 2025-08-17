import mongoose from "mongoose";

const aiInsightsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  journal_entry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JournalEntry",
    required: true
  },
  sentiment_score: {
    type: Number,
    required: true
  },
  sentiment_label: {
    type: String,
    required: true
  },
  key_themes: {
    type: String,
    required: true
  },
  ai_model_version:{
    type: String
  },
  processed_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const AiInsights = mongoose.model("AiInsights", aiInsightsSchema);

export default AiInsights;
