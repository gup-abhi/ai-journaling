import Insight from '../models/Insights.model.js';
import mongoose from 'mongoose';
import AppError from "../util/AppError.js";
import logger from '../lib/logger.js';

// Helper function to generate narrative summary
const generateNarrativeSummary = ({ sentimentLabel, sentimentScore, percentageChange, period, sentimentDistribution, totalEntries }) => {
    if (totalEntries === 0) {
        return "Start journaling to see your personal insights and mood patterns.";
    }

    // Base sentiment description
    let sentimentText = "";
    switch (sentimentLabel) {
        case 'positive':
            sentimentText = "Your mood has been mostly positive";
            break;
        case 'negative':
            sentimentText = "Your mood has been mostly negative";
            break;
        case 'mixed':
            sentimentText = "Your mood has been mixed";
            break;
        default:
            sentimentText = "Your mood has been mostly neutral";
    }

    // Add period context
    const periodText = period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'this year';

    // Add trend context
    let trendText = "";
    if (Math.abs(percentageChange) >= 5) {
        const direction = percentageChange > 0 ? 'improved' : 'declined';
        trendText = ` and has ${direction} compared to last ${period}`;
    }

    // Add distribution context for more nuanced description
    let distributionText = "";
    const dominantPercentage = Math.max(sentimentDistribution.positive, sentimentDistribution.negative, sentimentDistribution.neutral, sentimentDistribution.mixed);
    const dominantSentiment = Object.keys(sentimentDistribution).find(key => sentimentDistribution[key] === dominantPercentage);
    
    if (dominantPercentage >= 60) {
        const sentimentWords = {
            positive: 'positive and uplifting',
            negative: 'challenging and difficult',
            neutral: 'balanced and steady',
            mixed: 'varied and complex'
        };
        distributionText = `, with ${sentimentWords[dominantSentiment]} entries`;
    }

    return `${sentimentText}${trendText}${distributionText} ${periodText}.`;
};

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
    const { _id: user_id } = req.user;
    
    try {
        const trend = await Insight.findOne({ 
            journal_entry_id: journal_id,
            user_id: user_id 
        });

        if (!trend) {
            // Return null instead of throwing an error when no insights exist yet
            return res.status(200).json(null);
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
          sentiments: { $push: "$themes_topics.sentiment_towards_theme" }, // collect all sentiments for this theme
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          theme: "$_id",
          frequency: "$count",
          dominant_sentiment: {
            $let: {
              vars: {
                sentimentCounts: {
                  $reduce: {
                    input: "$sentiments",
                    initialValue: { positive: 0, negative: 0, neutral: 0, mixed: 0 },
                    in: {
                      positive: { $add: ["$$value.positive", { $cond: [{ $eq: ["$$this", "positive"] }, 1, 0] }] },
                      negative: { $add: ["$$value.negative", { $cond: [{ $eq: ["$$this", "negative"] }, 1, 0] }] },
                      neutral: { $add: ["$$value.neutral", { $cond: [{ $eq: ["$$this", "neutral"] }, 1, 0] }] },
                      mixed: { $add: ["$$value.mixed", { $cond: [{ $eq: ["$$this", "mixed"] }, 1, 0] }] },
                    }
                  }
                }
              },
              in: {
                $switch: {
                  branches: [
                    { 
                      case: { $gt: ["$$sentimentCounts.positive", { $max: ["$$sentimentCounts.negative", "$$sentimentCounts.neutral", "$$sentimentCounts.mixed"] }] }, 
                      then: "positive" 
                    },
                    { 
                      case: { $gt: ["$$sentimentCounts.negative", { $max: ["$$sentimentCounts.positive", "$$sentimentCounts.neutral", "$$sentimentCounts.mixed"] }] }, 
                      then: "negative" 
                    },
                    { 
                      case: { $gt: ["$$sentimentCounts.mixed", { $max: ["$$sentimentCounts.positive", "$$sentimentCounts.negative", "$$sentimentCounts.neutral"] }] }, 
                      then: "mixed" 
                    }
                  ],
                  default: "neutral"
                }
              }
            }
          },
          sentiment_breakdown: {
            positive: { $reduce: { input: "$sentiments", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $eq: ["$$this", "positive"] }, 1, 0] }] } } },
            negative: { $reduce: { input: "$sentiments", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $eq: ["$$this", "negative"] }, 1, 0] }] } } },
            neutral: { $reduce: { input: "$sentiments", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $eq: ["$$this", "neutral"] }, 1, 0] }] } } },
            mixed: { $reduce: { input: "$sentiments", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $eq: ["$$this", "mixed"] }, 1, 0] }] } } }
          }
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

  export const getCognitivePatternFrequency = async (req, res) => {
    const { _id: user_id } = req.user;
    const { period = 'all' } = req.params;
    const { limit = 10 } = req.query;

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
        const cognitivePatterns = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    ...dateFilter,
                },
            },
            { $unwind: '$patterns.cognitive' },
            {
                $group: {
                    _id: '$patterns.cognitive.pattern',
                    frequency: { $sum: 1 },
                },
            },
            {
                $sort: {
                    frequency: -1,
                },
            },
            {
                $limit: parseInt(limit),
            },
            {
                $project: {
                    _id: 0,
                    pattern: '$_id',
                    frequency: '$frequency',
                },
            },
        ]);

        res.status(200).json({
            user_id,
            period,
            cognitive_patterns: cognitivePatterns,
        });
    } catch (error) {
        logger.error(`Error fetching cognitive pattern frequency data: ${error}`);
        throw new AppError('Internal Server Error', 500);
    }
};

export const getTemporalMoodFluctuation = async (req, res) => {
    const { _id: user_id } = req.user;
    const { period = 'week' } = req.params; // 'week' for day of the week, 'day' for time of day

    let groupBy = {};
    let sortOrder = {};

    if (period === 'week') {
        groupBy = {
            $dayOfWeek: '$processed_at'
        };
        sortOrder = { _id: 1 };
    } else if (period === 'day') {
        groupBy = {
            $hour: '$processed_at'
        };
        sortOrder = { _id: 1 };
    } else {
        throw new AppError("Invalid period. Please specify 'week' or 'day'.", 400);
    }

    try {
        const temporalData = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                },
            },
            {
                $group: {
                    _id: groupBy,
                    avgSentiment: { $avg: '$sentiment.score' },
                },
            },
            {
                $sort: sortOrder,
            },
            {
                $project: {
                    _id: 0,
                    time_unit: '$_id',
                    avgSentiment: '$avgSentiment',
                },
            },
        ]);

        const dayMapping = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (period === 'week') {
            temporalData.forEach(item => {
                item.time_unit = dayMapping[item.time_unit];
            });
        }

        res.status(200).json({
            user_id,
            period,
            temporal_data: temporalData,
        });
    } catch (error) {
        logger.error(`Error fetching temporal mood fluctuation data: ${error}`);
        throw new AppError('Internal Server Error', 500);
    }
};

export const getTopStressors = async (req, res) => {
    const { _id: user_id } = req.user;
    const { period = 'all', limit = 10 } = req.query;

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
        const topStressors = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    ...dateFilter,
                },
            },
            { $unwind: '$stressors_triggers' },
            {
                $group: {
                    _id: '$stressors_triggers.trigger',
                    frequency: { $sum: 1 },
                    avgImpactLevel: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$stressors_triggers.impact_level', 'high'] }, then: 3 },
                                    { case: { $eq: ['$stressors_triggers.impact_level', 'medium'] }, then: 2 },
                                    { case: { $eq: ['$stressors_triggers.impact_level', 'low'] }, then: 1 },
                                ],
                                default: 0,
                            },
                        },
                    },
                },
            },
            {
                $sort: {
                    frequency: -1,
                },
            },
            {
                $limit: parseInt(limit),
            },
            {
                $project: {
                    _id: 0,
                    trigger: '$_id',
                    frequency: '$frequency',
                    avgImpactLevel: '$avgImpactLevel',
                },
            },
        ]);

        res.status(200).json({
            user_id,
            period,
            top_stressors: topStressors,
        });
    } catch (error) {
        logger.error(`Error fetching top stressors data: ${error}`);
        throw new AppError('Internal Server Error', 500);
    }
};

export const getSentimentSummary = async (req, res) => {
    const { _id: user_id } = req.user;
    const { period = 'week' } = req.params;

    if (!['week', 'month', 'year'].includes(period)) {
        throw new AppError("Invalid period. Please specify 'week', 'month', or 'year'.", 400);
    }

    try {
        const now = new Date();
        let startDate, previousStartDate;

        // Calculate current period and previous period for comparison
        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 1);
                previousStartDate = new Date(startDate);
                previousStartDate.setMonth(previousStartDate.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(startDate.getFullYear() - 1);
                previousStartDate = new Date(startDate);
                previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
                break;
        }

        // Get current period sentiment data
        const currentPeriodData = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    processed_at: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    averageSentiment: { $avg: '$sentiment.score' },
                    totalEntries: { $sum: 1 },
                    sentimentDistribution: {
                        $push: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$sentiment.overall', 'positive'] }, then: 'positive' },
                                    { case: { $eq: ['$sentiment.overall', 'negative'] }, then: 'negative' },
                                    { case: { $eq: ['$sentiment.overall', 'neutral'] }, then: 'neutral' },
                                    { case: { $eq: ['$sentiment.overall', 'mixed'] }, then: 'mixed' }
                                ],
                                default: 'neutral'
                            }
                        }
                    }
                }
            }
        ]);

        // Get previous period sentiment data for comparison
        const previousPeriodData = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    processed_at: { $gte: previousStartDate, $lt: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    averageSentiment: { $avg: '$sentiment.score' },
                    totalEntries: { $sum: 1 }
                }
            }
        ]);

        // Get trend data for sparkline (last 7 data points)
        const trendData = await Insight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    processed_at: { $gte: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) } // Last 7 days
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$processed_at' }
                    },
                    averageSentiment: { $avg: '$sentiment.score' }
                }
            },
            {
                $sort: { '_id': 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    sentiment: '$averageSentiment'
                }
            }
        ]);

        const currentData = currentPeriodData[0] || { averageSentiment: 0, totalEntries: 0, sentimentDistribution: [] };
        const previousData = previousPeriodData[0] || { averageSentiment: 0, totalEntries: 0 };

        // Calculate sentiment label
        const sentimentScore = currentData.averageSentiment;
        let sentimentLabel = 'neutral';
        if (sentimentScore > 0.1) sentimentLabel = 'positive';
        else if (sentimentScore < -0.1) sentimentLabel = 'negative';

        // Calculate percentage change
        const previousSentiment = previousData.averageSentiment;
        const percentageChange = previousSentiment !== 0 
            ? ((sentimentScore - previousSentiment) / Math.abs(previousSentiment)) * 100 
            : 0;

        // Calculate sentiment distribution
        const distribution = currentData.sentimentDistribution.reduce((acc, sentiment) => {
            acc[sentiment] = (acc[sentiment] || 0) + 1;
            return acc;
        }, {});

        const totalEntries = currentData.totalEntries;
        const sentimentDistribution = {
            positive: totalEntries > 0 ? Math.round((distribution.positive || 0) / totalEntries * 100) : 0,
            negative: totalEntries > 0 ? Math.round((distribution.negative || 0) / totalEntries * 100) : 0,
            neutral: totalEntries > 0 ? Math.round((distribution.neutral || 0) / totalEntries * 100) : 0,
            mixed: totalEntries > 0 ? Math.round((distribution.mixed || 0) / totalEntries * 100) : 0
        };

        // Generate trend description
        let trendDescription = 'No change';
        if (Math.abs(percentageChange) >= 5) {
            const direction = percentageChange > 0 ? 'up' : 'down';
            const change = Math.abs(Math.round(percentageChange));
            trendDescription = `${direction} ${change}% from last ${period}`;
        }

        // Generate narrative summary
        const narrativeSummary = generateNarrativeSummary({
            sentimentLabel,
            sentimentScore,
            percentageChange,
            period,
            sentimentDistribution,
            totalEntries
        });

        res.status(200).json({
            period,
            sentiment: {
                label: sentimentLabel,
                score: Math.round(sentimentScore * 100) / 100,
                percentage: Math.round(sentimentScore * 100),
                trend: {
                    percentageChange: Math.round(percentageChange * 10) / 10,
                    description: trendDescription
                }
            },
            distribution: sentimentDistribution,
            totalEntries: currentData.totalEntries,
            trendData: trendData.map(item => ({
                date: item.date,
                value: Math.round(item.sentiment * 100) / 100
            })),
            narrativeSummary
        });

    } catch (error) {
        logger.error(`Error fetching sentiment summary: ${error}`);
        throw new AppError("Internal Server Error", 500);
    }
};