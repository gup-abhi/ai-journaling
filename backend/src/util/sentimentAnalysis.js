import vader from 'vader-sentiment';

const analyzeSentiment = (text) => {
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    console.log("Sentiment analysis result:", intensity);
    return {
        sentiment_label: intensity.compound > 0.5 ? "positive" : intensity.compound < -0.5 ? "negative" : "neutral",
        sentiment_score: intensity.compound
    };
}

export default analyzeSentiment;