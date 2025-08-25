import journalEntry from '../models/JournalEntries.model.js';
import { generateInsights } from './generateInsights.js';
import connectDB from "../lib/mongo-connection.js";
import Insights from '../models/Insights.model.js';

async function generateInsightsForCurrentJournals() {
    try {
        const entries = await journalEntry.find(); // Fetch all journal entries
        const insights = [];

        console.log("Fetched Journal Entries count:", entries.length);
        if (entries) {
            for (const [index, entry] of entries.entries()) {
                console.log(`Generating insights for entry ${index + 1}/${entries.length}`);
                const result = await generateInsights(entry.content);
                insights.push(result);
            }
        }

        return {
            entries,
            insights
        };
    } catch (error) {
        console.error("Error generating insights for current journals:", error);
    }
}

async function addInsightsToInsightsCollections() {
    try {
        const { entries, insights } = await generateInsightsForCurrentJournals();

        for (const [index, insight] of insights.entries()) {
            const data = {
                user_id: entries[index].user_id,
                journal_entry_id: entries[index]._id,
                processed_at: entries[index].entry_date,
                ...insight
            };
            const newInsight = new Insights(data);
            await newInsight.save();
            console.log(`Insight saved of ${index + 1}/${insights.length}`);
        }
    } catch (error) {
        console.error("Error adding insights to the collection:", error);
    }
}

await connectDB();
await addInsightsToInsightsCollections();