import type { KeyTheme } from "./KeyTheme";

export type JournalSentiment = {
    sentiment_score: number;
    sentiment_label: string;
    key_themes: KeyTheme[];
}