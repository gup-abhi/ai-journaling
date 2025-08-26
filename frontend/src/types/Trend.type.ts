export type Sentiment = {
    overall: string;
    score: number;
    emotions: {
        emotion: string;
        intensity: string;
        trigger: string;
    }[];
    acknowledgement?: string;
};

export type Theme = {
    theme: string;
    sentiment_towards_theme: string;
    action_taken_or_planned: string;
};

export type Entity = {
    name: string;
    sentiment: string;
};

export type BehavioralPattern = {
    pattern: string;
    frequency_indicator: string;
};

export type CognitivePattern = {
    pattern: string;
    example_phrase: string;
};

export type TemporalPattern = {
    pattern: string;
    associated_time_period: string;
};

export type Goal = {
    goal: string;
    status: string;
    progress_indicator: string;
};

export type Stressor = {
    trigger: string;
    impact_level: string;
    coping_mechanism_mentioned: string;
};

export type Relationship = {
    person_or_group: string;
    emotional_tone: string;
    interaction_summary: string;
};

export type Health = {
    aspect: string;
    status_or_change: string;
    impact_on_mood: string;
};

export type Creativity = {
    readability: string;
    vocabulary_richness: string;
    writing_style: string;
};

export type Trend = {
    sentiment: Sentiment;
    themes_topics: Theme[];
    entities: {
        people: Entity[];
        organizations: Entity[];
        locations: Entity[];
        events: Entity[];
        products: Entity[];
    };
    summary: string;
    patterns: {
        behavioral: BehavioralPattern[];
        cognitive: CognitivePattern[];
        temporal: TemporalPattern[];
    };
    goals_aspirations: Goal[];
    stressors_triggers: Stressor[];
    relationships_social_dynamics: Relationship[];
    health_wellbeing: Health[];
    creativity_expression: Creativity;
    key_learnings_reflections: string[];
    actionable_next_steps: string[];
    question_answering_context: string;
    image_prompt: string;
    image_style_suggestions: string[];
};