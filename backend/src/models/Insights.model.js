import mongoose from "mongoose";

const SentimentSchema = new mongoose.Schema(
  {
    overall: { type: String, required: true },
    score: { type: Number, required: true },
    emotions: { type: [String], default: [] },
    acknowledgement: { type: String },
  },
  { _id: false }
);

const EntitySchema = new mongoose.Schema(
  {
    people: { type: [String], default: [] },
    organizations: { type: [String], default: [] },
    locations: { type: [String], default: [] },
    events: { type: [String], default: [] },
    products: { type: [String], default: [] },
  },
  { _id: false }
);

const PatternsSchema = new mongoose.Schema(
  {
    behavioral: { type: [String], default: [] },
    cognitive: { type: [String], default: [] },
    temporal: { type: [String], default: [] },
  },
  { _id: false }
);

const LanguageComplexitySchema = new mongoose.Schema(
  {
    readability: { type: String },
    vocabulary_richness: { type: String },
    writing_style: { type: String },
  },
  { _id: false }
);

const insightSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    journal_entry_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JournalEntry",
      required: true,
    },

    sentiment: { type: SentimentSchema, required: true },

    themes_topics: { type: [String], default: [] },
    entities: { type: EntitySchema, default: {} },

    summary: { type: String },

    patterns: { type: PatternsSchema, default: {} },

    goals_aspirations: { type: [String], default: [] },
    stressors_triggers: { type: [String], default: [] },
    relationships_social_dynamics: { type: [String], default: [] },
    health_wellbeing: { type: [String], default: [] },
    creativity_expression: { type: [String], default: [] },

    language_complexity: { type: LanguageComplexitySchema, default: {} },

    question_answering_context: { type: String },

    image_prompt: { type: String },
    image_style_suggestions: { type: [String], default: [] },

    ai_model_version: { type: String },
    processed_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Insight = mongoose.model("Insight", insightSchema);

export default Insight;
