import JournalEntry from "../models/JournalEntries.model.js";
import { countWords } from "../util/countWords.js";
import storeAiInsight from "../util/storeInsights.js";
import mongoose from "mongoose";
import AppError from "../util/AppError.js";
import logger from '../lib/logger.js';
import calculateStreak from "../util/streak.js";

export const createJournalEntry = async (req, res) => {
  const { content, entry_date, template_id } = req.body;

  if (!content || !entry_date) {
    throw new AppError("Content and entry date are required.", 400);
  }

  try {
    const newEntry = new JournalEntry({
      content,
      entry_date,
      template_id: template_id ? new mongoose.Types.ObjectId(template_id) : null,
      user_id: req.user._id,
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
      calculateStreak(newEntry.user_id);
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getJournalEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalEntries = await JournalEntry.countDocuments({
      user_id: req.user._id,
    });

    const entries = await JournalEntry.find({
      user_id: req.user._id,
    })
    .sort({ entry_date: -1 })
    .skip(skip)
    .limit(limit);

    const totalPages = Math.ceil(totalEntries / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      entries,
      pagination: {
        currentPage: page,
        totalPages,
        totalEntries,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getJournalEntryById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid entry ID.", 400);

    const entry = await JournalEntry.findOne({ _id: id });
    if (!entry)
      throw new AppError("Journal entry not found.", 404);

    return res.status(200).json(entry);
  } catch (error) {
    logger.error(error)
    throw new AppError("Internal Server Error", 500);
  }
};

export const getTotalJournalEntries = async (req, res) => {
  try {
    const totalEntries = await JournalEntry.countDocuments({
      user_id: req.user._id,
    });
    // logger.info(`Total journal entries: ${totalEntries}`);
    return res.status(200).json({ totalEntries });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getPaginatedJournalEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalEntries = await JournalEntry.countDocuments({
      user_id: req.user._id,
    });

    const entries = await JournalEntry.find({
      user_id: req.user._id,
    })
    .sort({ entry_date: -1 })
    .skip(skip)
    .limit(limit);

    const totalPages = Math.ceil(totalEntries / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      entries,
      pagination: {
        currentPage: page,
        totalPages,
        totalEntries,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
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
      user_id: req.user._id,
      entry_date: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    return res.status(200).json({ totalMonthlyEntries });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};
