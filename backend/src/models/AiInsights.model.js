import mongoose from "mongoose";

const ThemeSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true
  },
  sentimentLabel: {
    type: String,
    required: true
  },
  averageSentiment: {
    type: Number,
    required: true
  }
}, { _id: false });

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
    type: [ThemeSchema],
  },
  ai_model_version:{
    type: String
  },
  processed_at: {
    type: Date
  }
}, { timestamps: true });

const AiInsight = mongoose.model("AiInsight", aiInsightSchema);

export default AiInsight;
