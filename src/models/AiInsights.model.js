import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema({
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
    type: String
  },
  ai_model_version:{
    type: String
  },
  processed_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const AiInsight = mongoose.model("AiInsight", aiInsightSchema);

export default AiInsight;
