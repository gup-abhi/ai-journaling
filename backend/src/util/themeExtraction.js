import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-model';

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

export function getTopThemes(journalEntry, topN = 10) {
    const doc = nlp.readDoc(journalEntry);
    const themeScores = {};

    // Helper to add score to a theme
    const addScore = (theme, score) => {
        // Normalize the theme to its base form
        const normalized = nlp.readDoc(theme).tokens().out(its.normal, as.array).join(' ');
        if (normalized.length < 3) return; // Ignore short words
        themeScores[normalized] = (themeScores[normalized] || 0) + score;
    };

    // --- Scoring Pass 1: Core Subjects & Nouns ---
    // This is our base score.
    const coreSubjects = doc.tokens()
        .filter(t =>
            (t.out(its.pos) === 'NOUN' || t.out(its.pos) === 'PROPN') &&
            !t.out(its.stopWordFlag)
        );
    
    coreSubjects.each(token => {
        addScore(token.out(), 2); // +2 for every mention
        if (token.out(its.case) === 'titleCase') {
            addScore(token.out(), 3); // +3 bonus for being a proper name/project
        }
    });

    // --- Scoring Pass 2: Boost score for themes in "Actions" ---
    doc.sentences().each((sentence) => {
        const hasVerb = sentence.tokens().filter(t => t.out(its.pos) === 'VERB').length() > 0;
        if (hasVerb) {
            sentence.tokens().filter(t => t.out(its.pos) === 'NOUN' || t.out(its.pos) === 'PROPN')
                .each(noun => addScore(noun.out(), 1)); // +1 bonus for being part of an action
        }
    });

    // --- Scoring Pass 3: Major boost for "Emotional Hotspots" ---
    doc.sentences().each((sentence) => {
        const sentiment = sentence.out(its.sentiment);
        if (Math.abs(sentiment) > 0.2) { // Threshold for notable emotion
            sentence.tokens().filter(t => t.out(its.pos) === 'NOUN' || t.out(its.pos) === 'PROPN')
                .each(noun => addScore(noun.out(), 4)); // +4 bonus for being in an emotional sentence
        }
    });

    // --- Final Ranking ---
    const sortedThemes = Object.entries(themeScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topN) // Get the top N themes (5-10 as requested)
        .map(([theme, score]) => ({ theme, score }));

    return sortedThemes;
}

// example usage
// const topThemes = getTopThemes(journalEntry, 10); // Get the top 10 themes
// console.log('--- Top Journal Themes ---');
// console.log(topThemes);
