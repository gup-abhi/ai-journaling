import JournalEntry from '../models/JournalEntries.model.js';
import { countWords } from '../util/countWords.js';
import storeAiInsight from '../util/storeAiInsights.js';

export const createJournalEntry = async (req, res) => {
  const { content, entry_date } = req.body;

  if (!content || !entry_date) {
    return res.status(400).json({ error: "Content and entry date are required." });
  }

  console.log(req.cookies.user_id);

  try {
    const newEntry = new JournalEntry({
      content,
      entry_date,
      user_id: req.cookies.user_id,
      word_count: countWords(content)
    });

    await newEntry.save();
    res.status(201).json({ message: "Journal entry created successfully.", entry: newEntry });

    process.nextTick(() => {
      storeAiInsight(req, res, {
        user_id: newEntry.user_id,
        journal_entry_id: newEntry._id,
        content: newEntry.content,
        processed_at: newEntry.entry_date
      });
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user_id: req.cookies.user_id }).sort({ entry_date: -1 });
    return res.status(200).json({ entries });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


export const getJournalEntryById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).json({ error: "Entry ID is required." });

        const entry = await JournalEntry.findOne({ _id: id });
        if (!entry) return res.status(404).json({ error: "Journal entry not found." });

        return res.status(200).json({ entry });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};