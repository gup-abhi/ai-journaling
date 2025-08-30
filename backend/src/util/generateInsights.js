import { prompt } from "./prompts/insights.prompt.js";
import model from "../lib/google-gemma.js";
import { parseTextToJSON } from "./parsetTextToJSON.js";
import logger from '../lib/logger.js';

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

        // logger.info("Generated Insights Text:", text);

        // parsing text to JSON
        const parsed = parseTextToJSON(text);

        return parsed;
    } catch (error) {
        logger.error(`Error generating insights: ${error}`);
    }
}