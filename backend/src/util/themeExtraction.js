import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-model';

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

const BLOCK_LIST = new Set([
    "i'm", "i’m", "he's", "she's", "it's", "we're", "you're", "they're"
]);

function isThemeCandidate(token) {
    const normal = token.out(its.normal);
    const pos = token.out(its.pos);
    if (BLOCK_LIST.has(normal)) return false;
    const isNoun = (pos === 'NOUN' || pos === 'PROPN');
    if (!isNoun) return false;
    const isNotStopword = !token.out(its.stopWordFlag);
    const isLongEnough = normal.length >= 3;
    return isNotStopword && isLongEnough;
}

export function getTopThemes(journalEntry, topN = 10) {
    const doc = nlp.readDoc(journalEntry);
    // We now need to store more than just a score for each theme.
    const themeData = {};

    // Helper to initialize or update theme data
    const updateThemeData = (theme, scoreToAdd = 0, sentimentToAdd = 0) => {
        const normalized = nlp.readDoc(theme).tokens().out(its.normal, as.array).join(' ');
        if (!themeData[normalized]) {
            themeData[normalized] = { score: 0, sentimentSum: 0, sentimentCount: 0 };
        }
        themeData[normalized].score += scoreToAdd;
        if (sentimentToAdd !== 0) {
            themeData[normalized].sentimentSum += sentimentToAdd;
            themeData[normalized].sentimentCount += 1;
        }
    };

    const themeTokens = doc.tokens().filter(isThemeCandidate);
    const themeTokenIds = new Set(themeTokens.out(its.uniqueId));

    // --- Scoring Passes ---
    themeTokens.each(token => {
        updateThemeData(token.out(), 2); // Base score
        if (token.out(its.case) === 'titleCase') {
            updateThemeData(token.out(), 3); // Bonus for proper noun
        }
    });

    doc.sentences().each((sentence) => {
        const sentenceThemes = sentence.tokens().filter(t => themeTokenIds.has(t.out(its.uniqueId)));
        if (sentenceThemes.length() === 0) return;

        const hasVerb = sentence.tokens().filter(t => t.out(its.pos) === 'VERB').length() > 0;
        if (hasVerb) {
            sentenceThemes.each(noun => updateThemeData(noun.out(), 1)); // Action bonus
        }

        const sentiment = sentence.out(its.sentiment);
        if (Math.abs(sentiment) > 0.2) {
            sentenceThemes.each(noun => {
                // Add score AND sentiment data
                updateThemeData(noun.out(), 4, sentiment); // Emotion bonus
            });
        }
    });

    // --- Final Ranking and Labeling ---
    const sortedThemes = Object.entries(themeData)
        .sort(([, a], [, b]) => b.score - a.score) // Sort by final score
        .slice(0, topN)
        .map(([theme, data]) => {
            // Calculate average sentiment
            const averageSentiment = data.sentimentCount > 0 ? data.sentimentSum / data.sentimentCount : 0;
            
            // Assign a simple label
            let sentimentLabel = 'neutral';
            if (averageSentiment > 0.15) sentimentLabel = 'positive';
            if (averageSentiment < -0.15) sentimentLabel = 'negative';

            return {
                theme,
                score: data.score,
                sentimentLabel,
                averageSentiment: parseFloat(averageSentiment.toFixed(2))
            };
        });

    return sortedThemes;
}



// --- Example Usage ---
// const journalEntry = `
//     I don’t even know why I bother writing anymore. It feels pointless, just like everything else in my life. Every day is the same: I wake up tired, drag myself through the motions, and collapse back into bed wondering why I even bothered getting up in the first place. Nothing changes. Nothing gets better. It’s just this endless cycle of monotony and disappointment.

// I hate how small my life feels. Other people seem to be building something—careers, families, dreams—while I’m stuck in this gray zone of wasted time. I scroll, I distract myself, I pretend I don’t care, but deep down it gnaws at me. I do care. I hate that I care. I hate comparing myself, but I can’t stop. Every success I see from others feels like a reminder of how much I’ve failed.

// The worst part is, I don’t even have the energy to change. I keep telling myself, “Tomorrow I’ll start fresh, tomorrow I’ll try harder,” but tomorrow comes and I do the same nothing. I can’t escape this suffocating laziness, this heavy fog in my head. It’s pathetic. I’m pathetic. Even writing that out doesn’t shock me anymore—it’s just the truth I’ve accepted.

// I look at my reflection and all I see is someone I don’t respect. Someone I wouldn’t even want to know if I met them as a stranger. There’s no spark, no drive, just a shell walking around, pretending to have a purpose. And it’s exhausting pretending. Smiling when I don’t want to, answering “I’m fine” when I’m not, going through the daily charade like it matters.

// Sometimes I wonder if anyone would even notice if I disappeared. Sure, maybe a handful of people would miss me at first, but eventually, life would just move on without me. And that thought is both terrifying and strangely comforting. Terrifying because it makes me feel invisible. Comforting because maybe being invisible is better than being the constant disappointment I feel I am.

// Everything irritates me lately. People talking, people laughing, people acting like they have it all figured out—it all feels fake, or maybe I’m just bitter because I can’t seem to find any of that for myself. I hate this bitterness, but I can’t get rid of it. It’s like it’s seeped into my bones.

// Right now, it feels like I’m trapped in a life I didn’t choose, but the truth is, I did choose it—through every missed opportunity, every excuse, every fear I let control me. This is the result. And I hate it. I hate myself for letting it come to this.

// I don’t even know how to fix it anymore. Maybe I can’t. Maybe this is just it—the slow, painful realization that I’ll never be who I wanted to be.
// `;

// const topThemes = getTopThemes(journalEntry, 10);
// console.log('--- Top Journal Themes (Pragmatic Filter) ---');
// console.log(topThemes);
