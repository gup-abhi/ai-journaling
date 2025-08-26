import { prompt } from "./prompts/insights.prompt.js";
import model from "../lib/google-gemma.js";
import { parseTextToJSON } from "./parsetTextToJSON.js";

// You can now use the 'model' object to interact with the Gemma model.
// For example, to generate content:
export async function generateInsights(journalEntry) {
    try {

        // creating final prompt
        const finalPrompt = `${prompt}
        JOURNAL ENTRY: 
        {{${journalEntry}}}`

        // generate response from model
        const result = await model.generateContent(finalPrompt);
        const response = result.response;

        // extract text from response
        const text = response.text();

        // console.log("Generated Insights Text:", text);

        // parsing text to JSON
        const parsed = parseTextToJSON(text);

        return parsed;
    } catch (error) {
        console.error("Error generating insights:", error);
    }
}

// usage example
// console.log(JSON.stringify(await generateInsights(`
//     I don’t even know why I bother writing anymore. It feels pointless, just like everything else in my life. Every day is the same: I wake up tired, drag myself through the motions, and collapse back into bed wondering why I even bothered getting up in the first place. Nothing changes. Nothing gets better. It’s just this endless cycle of monotony and disappointment.

// I hate how small my life feels. Other people seem to be building something—careers, families, dreams—while I’m stuck in this gray zone of wasted time. I scroll, I distract myself, I pretend I don’t care, but deep down it gnaws at me. I do care. I hate that I care. I hate comparing myself, but I can’t stop. Every success I see from others feels like a reminder of how much I’ve failed.

// The worst part is, I don’t even have the energy to change. I keep telling myself, “Tomorrow I’ll start fresh, tomorrow I’ll try harder,” but tomorrow comes and I do the same nothing. I can’t escape this suffocating laziness, this heavy fog in my head. It’s pathetic. I’m pathetic. Even writing that out doesn’t shock me anymore—it’s just the truth I’ve accepted.

// I look at my reflection and all I see is someone I don’t respect. Someone I wouldn’t even want to know if I met them as a stranger. There’s no spark, no drive, just a shell walking around, pretending to have a purpose. And it’s exhausting pretending. Smiling when I don’t want to, answering “I’m fine” when I’m not, going through the daily charade like it matters.

// Sometimes I wonder if anyone would even notice if I disappeared. Sure, maybe a handful of people would miss me at first, but eventually, life would just move on without me. And that thought is both terrifying and strangely comforting. Terrifying because it makes me feel invisible. Comforting because maybe being invisible is better than being the constant disappointment I feel I am.

// Everything irritates me lately. People talking, people laughing, people acting like they have it all figured out—it all feels fake, or maybe I’m just bitter because I can’t seem to find any of that for myself. I hate this bitterness, but I can’t get rid of it. It’s like it’s seeped into my bones.

// Right now, it feels like I’m trapped in a life I didn’t choose, but the truth is, I did choose it—through every missed opportunity, every excuse, every fear I let control me. This is the result. And I hate it. I hate myself for letting it come to this.

// I don’t even know how to fix it anymore. Maybe I can’t. Maybe this is just it—the slow, painful realization that I’ll never be who I wanted to be.    
// `)))