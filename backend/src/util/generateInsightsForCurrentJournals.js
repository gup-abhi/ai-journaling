import journalEntry from '../models/JournalEntries.model.js';
import { generateInsights } from './generateInsights.js';
import connectDB from "../lib/mongo-connection.js";
import Insights from '../models/Insights.model.js';
import logger from '../lib/logger.js';

async function generateInsightsForCurrentJournals() {
    try {
        const entries = await journalEntry.find(); // Fetch all journal entries
        const insights = [];

        logger.info(`Fetched Journal Entries count: ${entries.length}`);
        if (entries) {
            for (const [index, entry] of entries.entries()) {
                if (index % 5 === 0) await new Promise(resolve => setTimeout(resolve, 10 * 1000)); // Throttle requests
                logger.info(`Generating insights for entry ${index + 1}/${entries.length} - id - ${entry._id}`);
                const insight = await generateInsights(entry.content);
                await addInsightsToInsightsCollections(entry, insight, index, entries.length);
            }
        }
    } catch (error) {
        logger.error(`Error generating insights for current journals: ${error}`);
    }
}

async function addInsightsToInsightsCollections(entry, insight, index, count) {
    try {
        const data = {
            user_id: entry.user_id,
            journal_entry_id: entry._id,
            processed_at: entry.entry_date,
            ...insight
        };
        const newInsight = new Insights(data);
        await newInsight.save();
        logger.info(`Insight saved of ${index + 1}/${count}`);
    } catch (error) {
        logger.error(`Error adding insights to the collection: ${error}`);
    }
}

await connectDB();
await generateInsightsForCurrentJournals();