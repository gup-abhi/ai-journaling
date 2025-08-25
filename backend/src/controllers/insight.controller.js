import AiInsight from '../models/AiInsights.model.js';
import mongoose from 'mongoose';
import AppError from "../util/AppError.js";

export const getSentimentTrendsByPeriod = async (req, res) => {
    const { user_id } = req.cookies;
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

        const sentimentTrend = await AiInsight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                },
            },
            {
                $group: {
                    _id: groupFields,
                    averageSentiment: { $avg: '$sentiment_score' },
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

        return res.status(200).json(sentimentTrend );
    } catch (error) {
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getSentimentTrends = async (req, res) => {
    const { user_id } = req.cookies;
    try {
        const trends = await AiInsight.find({ user_id: new mongoose.Types.ObjectId(user_id) });
        return res.status(200).json({ trends });
    } catch (error) {
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getSentimentTrendsByJournalId = async (req, res) => {
    const { journal_id } = req.params;
    try {
        const trend = await AiInsight.findOne({ journal_entry_id: journal_id });

        if (!trend) {
            throw new AppError("Trend not found", 404);
        }

        return res.status(200).json(trend);
    } catch (error) {
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getOverallSentiment = async (req, res) => {
    try {
        const overallSentiment = await AiInsight.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(req.cookies.user_id),
                },
            },
            {
                $group: {
                    _id: null, // Grouping by null to get overall sentiment
                    averageSentiment: { $avg: '$sentiment_score' },
                },
            },
        ]);

        return res.status(200).json({ overallSentiment: overallSentiment[0]?.averageSentiment * 100 || 0 });
    } catch (error) {
        console.error(error);
        throw new AppError("Internal Server Error", 500);
    }
};


export const getKeyThemesByPeriod = async (req, res) => {
    try {
    const { user_id } = req.cookies; // or req.user._id depending on your auth setup
    const { period = "all" } = req.params;
    const { limit = 10 } = req.query;

    // Time filter (based on "period")
    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;

      switch (period) {
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
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    const themes = await AiInsight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          ...dateFilter
        }
      },
      { $unwind: "$key_themes" }, // break out array
      {
        $group: {
          _id: "$key_themes.theme",
          totalScore: { $sum: "$key_themes.score" },
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          theme: "$_id",
          score: "$totalScore"
        }
      }
    ]);

    res.status(200).json({
      user_id,
      period,
      top_themes: themes
    });
  } catch (error) {
    console.error("Error fetching top themes:", error);
    throw new AppError("Internal Server Error", 500);
  }
};