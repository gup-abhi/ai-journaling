import mongoose from "mongoose";

const JournalTemplateSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true, // e.g., "Daily Reflection", "Goal-Oriented & Productivity"
  },
  name: {
    type: String,
    required: true, // e.g., "Gratitude Journal"
  },
  description: {
    type: String,
    required: true,
  },
  prompts: {
    type: [String], // Array of example prompts
    default: [],
  },
  benefits: {
    type: [String], // Array of benefits
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const JournalTemplate = mongoose.model("JournalTemplate", JournalTemplateSchema);

export default JournalTemplate;
