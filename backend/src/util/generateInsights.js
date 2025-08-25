import { prompt } from "./prompts/iinsights.prompt.js";
import model from "../lib/google-gemma.js";
import { parseTextToJSON } from "./parsetTextToJSON.js";

// You can now use the 'model' object to interact with the Gemma model.
// For example, to generate content:
export async function generateInsights(journalEntry) {
    try {

        // creating final prompt
        const finalPrompt = `${prompt}
        JOURNAL ENTRY: 
        ${journalEntry}`

        // generate response from model
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;

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

// usage 
// await generateInsights("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");