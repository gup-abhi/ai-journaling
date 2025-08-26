import type { KeyTheme } from "./KeyTheme.type";

export type JournalSentiment = {
    sentiment_score: number;
    sentiment_label: string;
    key_themes: KeyTheme[];
}