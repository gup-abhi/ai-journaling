export type Sentiment = {
    overall: string;
    score: number;
    emotions: string[];
    acknowledgement?: string;
};

export type LanguageComplexity = {
    readability: string;
    vocabulary_richness: string;
    writing_style: string;
};

export type Trend = {
    sentiment: Sentiment;
    entities: {
        people: string[];
        organizations: string[];
        locations: string[];
        events: string[];
        products: string[];
    };
    summary: string;
    patterns: {
        behavioral: string[];
        cognitive: string[];
        temporal: string[];
    };
    themes_topics: string[];
    goals_aspirations: string[];
    stressors_triggers: string[];
    relationships_social_dynamics: string[];
    health_wellbeing: string[];
    creativity_expression: string[];
    language_complexity: {
        readability: string;
        vocabulary_richness: string;
        writing_style: string;
    };
    question_answering_context: string;
    image_prompt: string;
    image_style_suggestions: string[];
};
