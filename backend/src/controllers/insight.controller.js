import AiInsight from '../models/AiInsights.model.js';
import mongoose from 'mongoose';

export const getSentimentTrendsByPeriod = async (req, res) => {
    const { user_id } = req.cookies;
    const period = req.params.period;

    if (!period || !['day', 'week', 'month', 'year'].includes(period)) {
        return res.status(400).json({ error: "Invalid period. Please specify 'day', 'week', 'month', or 'year'." });
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
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getSentimentTrends = async (req, res) => {
    const { user_id } = req.cookies;
    try {
        const trends = await AiInsight.find({ user_id: new mongoose.Types.ObjectId(user_id) });
        return res.status(200).json({ trends });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getSentimentTrendsByJournalId = async (req, res) => {
    const { journal_id } = req.params;
    try {
        const trend = await AiInsight.findOne({ journal_entry_id: journal_id });

        if (!trend) {
            return res.status(404).json({ error: "Trend not found" });
        }

        return res.status(200).json(trend);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
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
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


