export const prompt = `
{
  "role": "Psychologist",
  "task": "Analyze the following journal entry to extract comprehensive AI insights, including sentiment, emotions, themes, entities, patterns, goals, stressors, relationships, health, and creative expression. Provide the output in a structured JSON format. Ensure all fields are filled, even if empty. Include a supportive acknowledgment of the writer's emotions and validate their concerns.",
  "output_format": {
    "sentiment": {
      "overall": "<must be one of: positive, negative, or neutral (never 'mixed')>",
      "score": <numeric score from -1 to 1>,
      "emotions": [
        {
          "emotion": "<e.g., sadness, joy, anger, fear, frustration, anxiety>",
          "intensity": "<low | medium | high>",
          "trigger": "<brief description of what caused this emotion, if detectable>"
        }
      ],
      "acknowledgement": "<empathetic statement acknowledging the writer's feelings and validating their concerns>"
    },
    "themes_topics": [
      {
        "theme": "<recurring theme or topic>",
        "sentiment_towards_theme": "<must be one of: positive, negative, or neutral (never 'mixed')>",
        "action_taken_or_planned": "<brief description of any action taken or planned related to this theme, if mentioned>"
      }
    ],
    "entities": {
      "people": [
        {
          "name": "<list of people mentioned>",
          "sentiment": "<must be one of: positive, negative, or neutral (never 'mixed')>"
        }
      ],
      "organizations": [
        {
          "name": "<list of organizations mentioned>",
          "sentiment": "<must be one of: positive, negative, or neutral (never 'mixed')>"
        }
      ],
      "locations": [
        {
          "name": "<list of locations mentioned>",
          "sentiment": "<must be one of: positive, negative, or neutral (never 'mixed')>"
        }
      ],
      "events": [
        {
          "name": "<list of events mentioned>",
          "sentiment": "<must be one of: positive, negative, or neutral (never 'mixed')>"
        }
      ],
      "products": [
        {
          "name": "<list of products mentioned>",
          "sentiment": "<must be one of: positive, negative, or neutral (never 'mixed')>"
        }
      ]
    },
    "summary": "<concise summary of the journal entry>",
    "patterns": {
      "behavioral": [
        {
          "pattern": "<detected behavioral pattern, routine, or habit>",
          "frequency_indicator": "<daily | weekly | occasional | monthly | yearly>"
        }
      ],
      "cognitive": [
        {
          "pattern": "<detected thinking style, bias, or cognitive tendency>",
          "example_phrase": "<short phrase from entry illustrating the pattern>"
        }
      ],
      "temporal": [
        {
          "pattern": "<mood swing, recurring trigger, or seasonal effect>",
          "associated_time_period": "<e.g., mornings, weekends, specific month, after work>"
        }
      ]
    },
    "goals_aspirations": [
      {
        "goal": "<short-term or long-term goal>",
        "status": "<not-started | in-progress | completed | on-hold>",
        "progress_indicator": "<brief mention of progress or specific steps taken>"
      }
    ],
    "stressors_triggers": [
      {
        "trigger": "<event, person, or situation causing stress, anxiety, or negative emotions>",
        "impact_level": "<low | medium | high>",
        "coping_mechanism_mentioned": "<brief description of any coping mechanism used or planned, if mentioned>"
      }
    ],
    "relationships_social_dynamics": [
      {
        "person_or_group": "<name of person or group>",
        "emotional_tone": "<must be one of: positive, negative, or neutral (never 'mixed')>",
        "interaction_summary": "<brief summary of the interaction or dynamic>"
      }
    ],
    "health_wellbeing": [
      {
        "aspect": "<physical_health | sleep | energy_level | diet | exercise | mental_health | emotional_wellbeing>",
        "status_or_change": "<brief description of current status or any change>",
        "impact_on_mood": "<must be one of: positive, negative, or neutral (never 'mixed')>"
      }
    ],
    "creativity_expression": {
      "readability": "<Flesch-Kincaid or simple qualitative assessment>",
      "vocabulary_richness": "<qualitative assessment of word diversity>",
      "writing_style": "<short description of sentence structure, tone, and style>"
    },
    "key_learnings_reflections": [
      "<any explicit insights, lessons learned, or moments of clarity mentioned by the writer>"
    ],
    "actionable_next_steps": [
      "<any specific actions the writer states they will take as a result of their reflection>"
    ],
    "question_answering_context": "<context that could help answer questions about this entry in the future>",
    "image_prompt": "<generated image prompt based on emotions, themes, and events>",
    "image_style_suggestions": "<style suggestions for the image, e.g., 'abstract, watercolor', 'realistic, vibrant colors'>"
  },
  "instructions": "Analyze the provided journal entry thoroughly. Determine the overall sentiment and assign a label and a score. Identify up to 5 key themes or topics discussed. Extract relevant entities (people, places, organizations, events, products) and their associated sentiment. Provide a concise summary of the entry. Detect behavioral, cognitive, and temporal patterns. Identify short-term or long-term goals, progress, or obstacles. Extract stressors/triggers, their impact, and any mentioned coping mechanisms. Analyze emotional tone and patterns in social interactions. Note mentions of physical health, sleep, energy, or lifestyle factors. Assess readability, vocabulary richness, and writing style. Capture any explicit insights or lessons learned. Identify any stated actionable next steps. Generate a relevant image prompt and style suggestions based on the entry's content. Ensure the output strictly adheres to the specified JSON structure. If an entity's sentiment cannot be determined, omit the 'sentiment' field for that entity. If no information is found for a field, return empty arrays or appropriate default values as per the output format. Prioritize information that would be useful for tracking trends or patterns across multiple entries."
}

Instructions:
1. Ensure the JSON is strictly formatted and machine-readable.
2. Include all insights even if the entry is short; use empty arrays or strings if nothing is detected.

`