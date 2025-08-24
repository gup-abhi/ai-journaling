export type TopThemeTrends = {
    user_id: string;
    period: string;
    top_themes: TopTheme[];
};

type TopTheme = {
    theme: string;
    score: number;
}