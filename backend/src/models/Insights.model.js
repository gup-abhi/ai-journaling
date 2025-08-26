import mongoose from "mongoose";

const EmotionSchema = new mongoose.Schema(
  {
    emotion: { type: String, required: true },
    intensity: { type: String, enum: ["low", "medium", "high"] },
    trigger: { type: String },
  },
  { _id: false }
);

const SentimentSchema = new mongoose.Schema(
  {
    overall: { type: String, enum: ["positive", "negative", "neutral", "mixed"], required: true },
    score: { type: Number, required: true },
    emotions: { type: [EmotionSchema], default: [] },
    acknowledgement: { type: String },
  },
  { _id: false }
);

const ThemeTopicSchema = new mongoose.Schema(
  {
    theme: { type: String, required: true },
    sentiment_towards_theme: { type: String, enum: ["positive", "negative", "neutral", "mixed"] },
    action_taken_or_planned: { type: String },
  },
  { _id: false }
);

const EntityDetailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sentiment: { type: String, enum: ["positive", "negative", "neutral"] },
  },
  { _id: false }
);

const EntitiesSchema = new mongoose.Schema(
  {
    people: { type: [EntityDetailSchema], default: [] },
    organizations: { type: [EntityDetailSchema], default: [] },
    locations: { type: [EntityDetailSchema], default: [] },
    events: { type: [EntityDetailSchema], default: [] },
    products: { type: [EntityDetailSchema], default: [] },
  },
  { _id: false }
);

const BehavioralPatternSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true },
    frequency_indicator: { type: String, enum: ["daily", "weekly", "occasional", "monthly", "yearly"] },
  },
  { _id: false }
);

const CognitivePatternSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true },
    example_phrase: { type: String },
  },
  { _id: false }
);

const TemporalPatternSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true },
    associated_time_period: { type: String },
  },
  { _id: false }
);

const PatternsSchema = new mongoose.Schema(
  {
    behavioral: { type: [BehavioralPatternSchema], default: [] },
    cognitive: { type: [CognitivePatternSchema], default: [] },
    temporal: { type: [TemporalPatternSchema], default: [] },
  },
  { _id: false }
);

const GoalAspirationSchema = new mongoose.Schema(
  {
    goal: { type: String, required: true },
    status: { type: String, enum: ["not-started", "in-progress", "completed", "on-hold"], required: true },
    progress_indicator: { type: String },
  },
  { _id: false }
);

const StressorTriggerSchema = new mongoose.Schema(
  {
    trigger: { type: String, required: true },
    impact_level: { type: String, enum: ["low", "medium", "high"] },
    coping_mechanism_mentioned: { type: String },
  },
  { _id: false }
);

const RelationshipSocialDynamicSchema = new mongoose.Schema(
  {
    person_or_group: { type: String, required: true },
    emotional_tone: { type: String, enum: ["positive", "negative", "neutral", "mixed"] },
    interaction_summary: { type: String },
  },
  { _id: false }
);

const HealthWellbeingSchema = new mongoose.Schema(
  {
    aspect: { type: String, enum: ["physical_health", "sleep", "energy_level", "diet", "exercise", "mental_health", "emotional_wellbeing"], required: true },
    status_or_change: { type: String },
    impact_on_mood: { type: String, enum: ["positive", "negative", "neutral"] },
  },
  { _id: false }
);

const CreativityExpressionSchema = new mongoose.Schema(
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

    themes_topics: { type: [ThemeTopicSchema], default: [] },
    entities: { type: EntitiesSchema, default: {} },

    summary: { type: String },

    patterns: { type: PatternsSchema, default: {} },

    goals_aspirations: { type: [GoalAspirationSchema], default: [] },
    stressors_triggers: { type: [StressorTriggerSchema], default: [] },
    relationships_social_dynamics: { type: [RelationshipSocialDynamicSchema], default: [] },
    health_wellbeing: { type: [HealthWellbeingSchema], default: [] },
    creativity_expression: { type: CreativityExpressionSchema, default: {} },

    key_learnings_reflections: { type: [String], default: [] },
    actionable_next_steps: { type: [String], default: [] },

    language_complexity: { type: CreativityExpressionSchema, default: {} }, // Reusing CreativityExpressionSchema for language_complexity

    question_answering_context: { type: String },

    image_prompt: { type: String },
    image_style_suggestions: { type: String }, // Changed to String as per prompt

    ai_model_version: { type: String },
    processed_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Insight = mongoose.model("Insight", insightSchema);

export default Insight;