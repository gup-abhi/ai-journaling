import Insight from '../models/Insights.model.js';
import mongoose from 'mongoose';
import AppError from "../util/AppError.js";
import logger from '../lib/logger.js';

export const getSentimentTrendsByPeriod = async (req, res) => {
    const { _id: user_id } = req.user;
    const period = req.params.period;

    if (!period || !['day', 'week', 'month', 'year'].includes(period)) {
        throw new AppError("Invalid period. Please specify 'day', 'week', 'month', or 'year'.", 400);
    }

    try {
        let dateFormat;
        let groupFields = {};

        switch (period) {
            case 'day':
            dateFormat = '%Y-%m-%d';
            groupFields = { day: { $dateToString: { format: dateFormat, date: '$processed_at' } } };
            break;

            case 'week':
            // MongoDB's $isoWeekYear and $isoWeek are good for consistent week numbering
            groupFields = {
                year: { $isoWeekYear: '$processed_at' },
                week: { $isoWeek: '$processed_at' }
            };
            break;

            case 'month':
            dateFormat = '%Y-%m';
            groupFields = { month: { $dateToString: { format: dateFormat, date: '$processed_at' } } };
            break;

            case 'year':
            dateFormat = '%Y';
            groupFields = { year: { $dateToString: { format: dateFormat, date: '$processed_at' } } };
            break;

            default:
            // Default to day if an invalid period is provided
            dateFormat = '%Y-%m-%d';
            groupFields = { day: { $dateToString: { format: dateFormat, date: '$processed_at' } } };
        }

        const sentimentTrend = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                },
            },
            {
                $group: {
                    _id: groupFields,
                    averageSentiment: { $avg: '$sentiment.score' },
                },
            },
            {
                $sort: {
                    '_id.year': 1, // Sort by year first
                    '_id.month': 1, // Then by month
                    '_id.week': 1, // Then by week
                    '_id.day': 1, // Then by day
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    period_label: {
                        $cond: {
                            if: { $eq: [period, 'day'] },
                            then: '$_id.day',
                            else: {
                                $cond: {
                                    if: { $eq: [period, 'week'] },
                                    then: { $concat: [ { $toString: '$_id.year' }, '-W', { $toString: '$_id.week' } ] },
                                    else: {
                                        $cond: {
                                            if: { $eq: [period, 'month'] },
                                            then: '$_id.month',
                                            else: '$_id.year'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    averageSentiment: 1,
                },
            },
        ]);

        return res.status(200).json(sentimentTrend);
    } catch (error) {
        logger.error(`Error fetching sentiment trend: ${error}`);
        throw new AppError("Internal Server Error", 500);
    }
};

export const getSentimentTrends = async (req, res) => {
    const { _id: user_id } = req.user;
    try {
        const trends = await Insight.find({ user_id: new mongoose.Types.ObjectId(user_id) });
        return res.status(200).json({ trends });
    } catch (error) {
        logger.error(`Error fetching sentiment trends: ${error}`);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getTrendsByJournalId = async (req, res) => {
    const { journal_id } = req.params;
    try {
        const trend = await Insight.findOne({ journal_entry_id: journal_id });

        if (!trend) {
            throw new AppError("Trend not found", 404);
        }

        return res.status(200).json(trend);
    } catch (error) {
        logger.error(`Error fetching trend by journal ID: ${error}`);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getOverallSentiment = async (req, res) => {
    const { _id: user_id } = req.user;

    try {
        const overallSentiment = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                },
            },
            {
                $group: {
                    _id: null, // Group all entries together
                    averageSentiment: { $avg: '$sentiment.score' }, // ✅ updated path
                },
            },
        ]);

        return res.status(200).json({
            overallSentiment: overallSentiment[0]?.averageSentiment * 100 || 0, // return as percentage
        });
    } catch (error) {
        logger.error(`Error fetching overall sentiment: ${error}`);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getKeyThemesByPeriod = async (req, res) => {
  try {
    const { _id: user_id } = req.user; // or req.user._id depending on your auth setup
    const { period = "all" } = req.params;
    const { limit = 10 } = req.query;

    // Time filter (based on "period")
    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;

      switch (period) {
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    const themes = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          ...dateFilter,
        },
      },
      { $unwind: "$themes_topics" }, // flatten array
      {
        $group: {
          _id: "$themes_topics.theme",
          count: { $sum: 1 }, // frequency of each theme
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          theme: "$_id",
          frequency: "$count",
        },
      },
    ]);

    res.status(200).json({
      user_id,
      period,
      top_themes: themes,
    });
  } catch (error) {
    logger.error(`Error fetching top themes: ${error}`);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getEmotionDistribution = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { period } = req.params;

    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;

      switch (period) {
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = { processed_at: { $gte: startDate } };
      }
    }

    const emotionDistribution = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          "sentiment.emotions": { $exists: true, $ne: [] },
          ...dateFilter,
        },
      },
      { $unwind: "$sentiment.emotions" },
      {
        $group: {
          _id: "$sentiment.emotions.emotion",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          emotion: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({ emotionDistribution });
  } catch (error) {
    logger.error(`Error fetching emotion distribution: ${error}`);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getEmotionIntensityHeatmap = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { period } = req.params;

    if (!period || !['day', 'week', 'month', 'year'].includes(period)) {
      throw new AppError("Invalid period. Please specify 'day', 'week', 'month', or 'year'.", 400);
    }

    let dateFilter = {};
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1)); // Last 24 hours
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7)); // Last 7 days
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1)); // Last month
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // Last year
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      dateFilter = { processed_at: { $gte: startDate } };
    }

    const intensityMap = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          "sentiment.emotions": { $exists: true, $ne: [] },
          ...dateFilter,
        },
      },
      { $unwind: "$sentiment.emotions" },
      {
        $project: {
          _id: 0,
          emotion: "$sentiment.emotions.emotion",
          intensity: "$sentiment.emotions.intensity",
          processed_at: "$processed_at",
          // Map intensity to numerical value
          intensity_value: {
            $switch: {
              branches: [
                { case: { $eq: ["$sentiment.emotions.intensity", "low"] }, then: 1 },
                { case: { $eq: ["$sentiment.emotions.intensity", "medium"] }, then: 2 },
                { case: { $eq: ["$sentiment.emotions.intensity", "high"] }, then: 3 },
              ],
              default: 0 // Default for unknown intensity
            }
          }
        }
      },
      {
        $group: {
          _id: {
            emotion: "$emotion",
            time_unit: {
              $dateToString: {
                format: period === 'day' ? '%Y-%m-%d %H' : (period === 'week' ? '%Y-%m-%d' : (period === 'month' ? '%Y-%m' : '%Y')),
                date: "$processed_at"
              }
            }
          },
          average_intensity: { $avg: "$intensity_value" }
        }
      },
      {
        $project: {
          _id: 0,
          emotion: "$_id.emotion",
          time_unit: "$_id.time_unit",
          average_intensity: { $round: ["$average_intensity", 2] } // Round to 2 decimal places
        }
      },
      {
        $sort: {
          time_unit: 1,
          emotion: 1
        }
      }
    ]);

    res.status(200).json({ intensityMap });
  } catch (error) {
    logger.error(`Error fetching emotion intensity heatmap: ${error}`);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getThematicSentiment = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { period } = req.params;
    const { limit = 10 } = req.query; // Default to top 10 themes

    if (!period || !['day', 'week', 'month', 'year', 'all'].includes(period)) {
      throw new AppError("Invalid period. Please specify 'day', 'week', 'month', 'year', or 'all'.", 400);
    }

    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;

      switch (period) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = { processed_at: { $gte: startDate } };
      }
    }

    const thematicSentiment = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          "themes_topics": { $exists: true, $ne: [] },
          ...dateFilter,
        },
      },
      { $unwind: "$themes_topics" },
      {
        $group: {
          _id: {
            theme: "$themes_topics.theme",
            sentiment: "$themes_topics.sentiment_towards_theme",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.theme",
          sentiments: {
            $push: {
              sentiment: "$_id.sentiment",
              count: "$count",
            },
          },
          total_count: { $sum: "$count" },
        },
      },
      { $sort: { total_count: -1 } }, // Sort by total count to get top themes
      { $limit: parseInt(limit) }, // Limit to top N themes
      {
        $project: {
          _id: 0,
          theme: "$_id",
          positive: {
            $sum: {
              $map: {
                input: "$sentiments",
                as: "s",
                in: { $cond: [{ $eq: ["$$s.sentiment", "positive"] }, "$$s.count", 0] },
              },
            },
          },
          negative: {
            $sum: {
              $map: {
                input: "$sentiments",
                as: "s",
                in: { $cond: [{ $eq: ["$$s.sentiment", "negative"] }, "$$s.count", 0] },
              },
            },
          },
          neutral: {
            $sum: {
              $map: {
                input: "$sentiments",
                as: "s",
                in: { $cond: [{ $eq: ["$$s.sentiment", "neutral"] }, "$$s.count", 0] },
              },
            },
          },
          mixed: {
            $sum: {
              $map: {
                input: "$sentiments",
                as: "s",
                in: { $cond: [{ $eq: ["$$s.sentiment", "mixed"] }, "$$s.count", 0] },
              },
            },
          },
          total_count: 1,
        },
      },
      { $sort: { total_count: -1 } }, // Final sort by total count
    ]);

    res.status(200).json({ thematicSentiment });
  } catch (error) {
    logger.error(`Error fetching thematic sentiment: ${error}`);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getThemeActionRadarData = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { period } = req.params;
    const { limit = 5 } = req.query; // Default to top 5 themes for radar chart

    if (!period || !['day', 'week', 'month', 'year', 'all'].includes(period)) {
      throw new AppError("Invalid period. Please specify 'day', 'week', 'month', 'year', or 'all'.", 400);
    }

    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;

      switch (period) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = { processed_at: { $gte: startDate } };
      }
    }

    const themeActionData = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          "themes_topics": { $exists: true, $ne: [] },
          ...dateFilter,
        },
      },
      { $unwind: "$themes_topics" },
      {
        $match: {
          "themes_topics.action_taken_or_planned": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$themes_topics.theme",
          action_count: { $sum: 1 },
        },
      },
      { $sort: { action_count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          theme: "$_id",
          action_count: 1,
        },
      },
    ]);

    res.status(200).json({ themeActionData });
  } catch (error) {
    logger.error(`Error fetching theme action radar data: ${error}`);
    throw new AppError("Internal Server Error", 500);
  }
};

export const getEntitySentimentTreemap = async (req, res) => {
    const { _id: user_id } = req.user;
    const { period = 'all' } = req.params;
    const { limit = 20 } = req.query;
  
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate;
  
      switch (period) {
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }
  
      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }
  
    try {
      const entityTypes = ['people', 'organizations', 'locations', 'events', 'products'];
      let allEntities = [];
  
      for (const type of entityTypes) {
        const entities = await Insight.aggregate([
          {
            $match: {
              user_id: new mongoose.Types.ObjectId(user_id),
              ...dateFilter,
            },
          },
          { $unwind: `$entities.${type}` },
          {
            $group: {
              _id: `$entities.${type}.name`,
              frequency: { $sum: 1 },
              sentimentScore: {
                $sum: {
                  $switch: {
                    branches: [
                      { case: { $eq: [`$entities.${type}.sentiment`, 'positive'] }, then: 1 },
                      { case: { $eq: [`$entities.${type}.sentiment`, 'negative'] }, then: -1 },
                    ],
                    default: 0,
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              name: '$_id',
              type: type,
              frequency: '$frequency',
              avgSentiment: { $divide: ['$sentimentScore', '$frequency'] },
            },
          },
        ]);
        allEntities = allEntities.concat(entities);
      }
  
      allEntities.sort((a, b) => b.frequency - a.frequency);
      const topEntities = allEntities.slice(0, parseInt(limit));
  
      res.status(200).json({
        user_id,
        period,
        top_entities: topEntities,
      });
    } catch (error) {
      logger.error(`Error fetching entity sentiment treemap data: ${error}`);
      throw new AppError('Internal Server Error', 500);
    }
  };
