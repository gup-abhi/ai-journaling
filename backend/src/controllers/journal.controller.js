import JournalEntry from "../models/JournalEntries.model.js";
import { countWords } from "../util/countWords.js";
import storeAiInsight from "../util/storeAiInsights.js";
import mongoose from "mongoose";

export const createJournalEntry = async (req, res) => {
  const { content, entry_date, template_id } = req.body;

  if (!content || !entry_date) {
    return res
      .status(400)
      .json({ error: "Content and entry date are required." });
  }

  try {
    const newEntry = new JournalEntry({
      content,
      entry_date,
      template_id: template_id ? new mongoose.Types.ObjectId(template_id) : null,
      user_id: req.cookies.user_id,
      word_count: countWords(content),
    });

    await newEntry.save();
    res
      .status(201)
      .json({
        message: "Journal entry created successfully.",
        entry: newEntry,
      });

    process.nextTick(() => {
      storeAiInsight(req, res, {
        user_id: newEntry.user_id,
        journal_entry_id: newEntry._id,
        content: newEntry.content,
        processed_at: newEntry.entry_date,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({
      user_id: req.cookies.user_id,
    }).sort({ entry_date: -1 });
    return res.status(200).json({ entries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getJournalEntryById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid entry ID." });

    const entry = await JournalEntry.findOne({ _id: id });
    if (!entry)
      return res.status(404).json({ error: "Journal entry not found." });

    console.log(entry);

    return res.status(200).json(entry);
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTotalJournalEntries = async (req, res) => {
  try {
    const totalEntries = await JournalEntry.countDocuments({
      user_id: req.cookies.user_id,
    });
    console.log("Total journal entries:", totalEntries);
    return res.status(200).json({ totalEntries });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTotalMonthJournalEntries = async (req, res) => {
  try {
    const now = new Date();

    // Start of current month (e.g., Aug 1 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of next month (e.g., Sep 1 00:00:00)
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalMonthlyEntries = await JournalEntry.countDocuments({
      user_id: req.cookies.user_id,
      entry_date: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    return res.status(200).json({ totalMonthlyEntries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
