export const prompt = `
{
  "role": "Psychologist",
  "task": "Analyze the following journal entry to extract comprehensive AI insights. You MUST use only the exact values specified for each field and make sure all the fields are present in the final response. Any deviation from the allowed values will result in an invalid response.",

  "CRITICAL_CONSTRAINTS": {
    "sentiment_values": ["positive", "negative", "neutral"],
    "intensity_values": ["low", "medium", "high"],
    "status_values": ["not-started", "in-progress", "completed", "on-hold"],
    "frequency_values": ["daily", "weekly", "occasional", "monthly", "yearly"],
    "impact_levels": ["low", "medium", "high"],
    "health_aspects": ["physical_health", "sleep", "energy_level", "diet", "exercise", "mental_health", "emotional_wellbeing"],
    "emotional_tones": ["positive", "negative", "neutral"]
  },

  "VALIDATION_RULES": [
    "sentiment.overall MUST be exactly one of: positive, negative, neutral",
    "sentiment.score MUST be a number between -1 and 1",
    "All emotion intensities MUST be exactly one of: low, medium, high",
    "All sentiment fields MUST be exactly one of: positive, negative, neutral",
    "All status fields MUST be exactly one of: not-started, in-progress, completed, on-hold",
    "All frequency_indicator fields MUST be exactly one of: daily, weekly, occasional, monthly, yearly",
    "All impact_level fields MUST be exactly one of: low, medium, high",
    "All health aspects MUST be exactly one of: physical_health, sleep, energy_level, diet, exercise, mental_health, emotional_wellbeing",
    "If no data exists for a field, use empty array [] or empty string \"\""
  ],

  "output_format": {
    "sentiment": {
      "overall": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed",
      "score": "REQUIRED: Numeric value between -1.0 and 1.0",
      "emotions": [
        {
          "emotion": "Single word emotion (e.g., sadness, joy, anger, fear, frustration, anxiety)",
          "intensity": "REQUIRED: Must be exactly 'low', 'medium', or 'high' - no other values allowed",
          "trigger": "Brief description or empty string if none"
        }
      ],
      "acknowledgement": "Empathetic statement acknowledging feelings"
    },
    "themes_topics": [
      {
        "theme": "Recurring theme or topic as string",
        "sentiment_towards_theme": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed",
        "action_taken_or_planned": "Brief description or empty string"
      }
    ],
    "entities": {
      "people": [
        {
          "name": "Person's name as string",
          "sentiment": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed"
        }
      ],
      "organizations": [
        {
          "name": "Organization name as string",
          "sentiment": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed"
        }
      ],
      "locations": [
        {
          "name": "Location name as string",
          "sentiment": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed"
        }
      ],
      "events": [
        {
          "name": "Event name as string",
          "sentiment": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed"
        }
      ],
      "products": [
        {
          "name": "Product name as string",
          "sentiment": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed"
        }
      ]
    },
    "summary": "Concise summary of the journal entry",
    "patterns": {
      "behavioral": [
        {
          "pattern": "Behavioral pattern as string",
          "frequency_indicator": "REQUIRED: Must be exactly 'daily', 'weekly', 'occasional', 'monthly', or 'yearly' - no other values allowed"
        }
      ],
      "cognitive": [
        {
          "pattern": "Cognitive pattern as string",
          "example_phrase": "Example phrase as string"
        }
      ],
      "temporal": [
        {
          "pattern": "Temporal pattern as string",
          "associated_time_period": "Time period as string"
        }
      ]
    },
    "goals_aspirations": [
      {
        "goal": "Goal description as string",
        "status": "REQUIRED: Must be exactly 'not-started', 'in-progress', 'completed', or 'on-hold' - no other values allowed",
        "progress_indicator": "Progress description as string"
      }
    ],
    "stressors_triggers": [
      {
        "trigger": "Stressor or trigger as string",
        "impact_level": "REQUIRED: Must be exactly 'low', 'medium', or 'high' - no other values allowed",
        "coping_mechanism_mentioned": "Coping mechanism as string or empty string"
      }
    ],
    "relationships_social_dynamics": [
      {
        "person_or_group": "Person or group name as string",
        "emotional_tone": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed",
        "interaction_summary": "Interaction summary as string"
      }
    ],
    "health_wellbeing": [
      {
        "aspect": "REQUIRED: Must be exactly one of 'physical_health', 'sleep', 'energy_level', 'diet', 'exercise', 'mental_health', 'emotional_wellbeing' - no other values allowed",
        "status_or_change": "Status or change description as string",
        "impact_on_mood": "REQUIRED: Must be exactly 'positive', 'negative', or 'neutral' - no other values allowed"
      }
    ],
    "creativity_expression": {
      "readability": "Readability assessment as string",
      "vocabulary_richness": "Vocabulary richness as string",
      "writing_style": "Writing style description as string"
    },
    "key_learnings_reflections": [
      "Learning or reflection as string"
    ],
    "actionable_next_steps": [
      "Next step as string"
    ],
    "question_answering_context": "Context for questions as string",
    "image_prompt": "Image generation prompt as string",
    "image_style_suggestions": "Image style suggestions as string"
  },

  "RESPONSE_REQUIREMENTS": [
    "You MUST return valid JSON that can be parsed by JSON.parse()",
    "Every enum field MUST use exactly the specified values - no variations, synonyms, or custom values",
    "If you cannot determine a value, use the closest allowed option or leave empty",
    "Double-check each enum field before responding",
    "Use empty arrays [] for missing list data, empty strings \"\" for missing string data"
  ],

  "EXAMPLES_OF_CORRECT_VALUES": {
    "sentiment.overall": "positive (not 'very positive', 'somewhat positive', etc.)",
    "emotion.intensity": "high (not 'very high', 'intense', 'strong', etc.)",
    "goal.status": "in-progress (not 'ongoing', 'working on', 'started', etc.)",
    "frequency_indicator": "weekly (not 'once a week', 'every week', etc.)",
    "health.aspect": "mental_health (not 'mental', 'psychological', 'mind', etc.)"
  },

  "FINAL_INSTRUCTION": "Before submitting your response, verify that every single enum field uses exactly one of the allowed values. Any field that doesn't match the allowed values exactly will cause the analysis to fail. When in doubt, choose the closest allowed value."
}
`