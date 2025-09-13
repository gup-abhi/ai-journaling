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
      calculateStreak(newEntry.user_id, newEntry.entry_date);
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

    const entry = await JournalEntry.findOne({ 
      _id: id,
      user_id: req.user._id 
    });
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

    // Build filter object
    const filter = { user_id: req.user._id };

    // Date filtering
    const { month, year } = req.query;
    console.log('Backend: Received filter parameters - month:', month, 'year:', year);

    if (month && year && month.toString().trim() !== '' && year.toString().trim() !== '') {
      // Filter by month and year
      const startMonth = new Date(year, month - 1, 1); // month is 1-indexed
      const endMonth = new Date(year, month, 1); // First day of next month

      filter.entry_date = {
        $gte: startMonth,
        $lt: endMonth
      };
      console.log('Backend: Applied month+year filter:', { startMonth, endMonth });
    } else if (year && year.toString().trim() !== '') {
      // Filter by year only
      const startYear = new Date(year, 0, 1); // January 1st
      const endYear = new Date(parseInt(year) + 1, 0, 1); // January 1st of next year

      filter.entry_date = {
        $gte: startYear,
        $lt: endYear
      };
      console.log('Backend: Applied year filter:', { startYear, endYear });
    } else {
      console.log('Backend: No date filters applied, fetching all journals');
    }

    // Get total count for pagination metadata
    const totalEntries = await JournalEntry.countDocuments(filter);

    const entries = await JournalEntry.find(filter)
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

export const getTimelineData = async (req, res) => {
  try {
    const { period = 'week', theme } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        endDate = now;
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    // Build filter for journal entries
    const journalFilter = {
      user_id: req.user._id,
      entry_date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Get journal entries
    const entries = await JournalEntry.find(journalFilter)
      .sort({ entry_date: -1 })
      .lean();

    // Get insights for each entry
    const Insight = (await import('../models/Insights.model.js')).default;
    const entryIds = entries.map(entry => entry._id);
    const insights = await Insight.find({
      journal_entry_id: { $in: entryIds },
      user_id: req.user._id
    }).lean();

    // Create a map of insights by journal entry ID
    const insightsMap = {};
    insights.forEach(insight => {
      insightsMap[insight.journal_entry_id.toString()] = insight;
    });

    // Attach insights to entries
    const entriesWithInsights = entries.map(entry => ({
      ...entry,
      insights: insightsMap[entry._id.toString()] || null
    }));

    // Filter by theme if specified
    let filteredEntries = entriesWithInsights;
    if (theme) {
      filteredEntries = entriesWithInsights.filter(entry => 
        entry.insights && 
        entry.insights.themes_topics && 
        entry.insights.themes_topics.some(t => 
          t.theme.toLowerCase().includes(theme.toLowerCase())
        )
      );
    }

    // Format timeline data
    const timelineData = filteredEntries.map(entry => {
      const insight = entry.insights || {};
      const sentiment = insight.sentiment || {};
      
      return {
        id: entry._id,
        date: entry.entry_date,
        content: entry.content,
        wordCount: entry.word_count,
        sentiment: {
          overall: sentiment.overall || 'neutral',
          score: sentiment.score || 0,
          emotions: sentiment.emotions || []
        },
        themes: insight.themes_topics || [],
        summary: insight.summary || '',
        keyEvents: insight.entities?.events || [],
        significantEvents: insight.key_learnings_reflections || []
      };
    });

    return res.status(200).json({
      timeline: timelineData,
      period,
      theme: theme || null,
      totalEntries: timelineData.length,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getJournalEntriesByTheme = async (req, res) => {
  try {
    const { theme, period } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!theme) {
      throw new AppError("Theme parameter is required.", 400);
    }

    // Calculate date range based on period
    let startDate, endDate;
    const now = new Date();
    
    if (period) {
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          endDate = now;
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          endDate = now;
          break;
        default:
          startDate = null;
          endDate = null;
      }
    }

    // Build date filter for journal entries
    const journalDateFilter = {};
    if (startDate && endDate) {
      journalDateFilter.entry_date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Get all journal entries for the user with date filter
    const entries = await JournalEntry.find({
      user_id: req.user._id,
      ...journalDateFilter
    })
    .sort({ entry_date: -1 })
    .lean();

    // Get insights for all entries
    const Insight = (await import('../models/Insights.model.js')).default;
    const entryIds = entries.map(entry => entry._id);
    const insights = await Insight.find({
      journal_entry_id: { $in: entryIds },
      user_id: req.user._id,
      'themes_topics.theme': { $regex: theme, $options: 'i' }
    }).lean();

    // Create a map of insights by journal entry ID
    const insightsMap = {};
    insights.forEach(insight => {
      insightsMap[insight.journal_entry_id.toString()] = insight;
    });

    // Filter entries that have the specified theme
    const filteredEntries = entries.filter(entry => 
      insightsMap[entry._id.toString()]
    );

    // Get total count for pagination
    const totalEntries = filteredEntries.length;

    // Apply pagination
    const paginatedEntries = filteredEntries.slice(skip, skip + limit);

    // Format the response data
    const formattedEntries = paginatedEntries.map(entry => {
      const insight = insightsMap[entry._id.toString()];
      const sentiment = insight?.sentiment || {};
      
      // Find the specific theme in the insights
      const matchedTheme = insight?.themes_topics?.find(t => 
        t.theme.toLowerCase().includes(theme.toLowerCase())
      );

      return {
        id: entry._id,
        content: entry.content,
        entry_date: entry.entry_date,
        word_count: entry.word_count,
        sentiment: {
          overall: sentiment.overall || 'neutral',
          score: sentiment.score || 0,
          emotions: sentiment.emotions || []
        },
        matched_theme: matchedTheme,
        all_themes: insight?.themes_topics || [],
        summary: insight?.summary || '',
        key_learnings: insight?.key_learnings_reflections || []
      };
    });

    const totalPages = Math.ceil(totalEntries / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      entries: formattedEntries,
      theme,
      period: period || 'all',
      pagination: {
        currentPage: page,
        totalPages,
        totalEntries,
        hasNextPage,
        hasPrevPage,
        limit
      },
      dateRange: startDate && endDate ? {
        start: startDate,
        end: endDate
      } : null
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};
