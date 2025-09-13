import Insight from '../models/Insights.model.js';
import JournalEntries from '../models/JournalEntries.model.js';
import mongoose from 'mongoose';
import logger from '../lib/logger.js';

/**
 * Simple rules engine for generating actionable nudges based on journal patterns
 */

// Nudge types and their corresponding messages
const NUDGE_TYPES = {
  LOW_SENTIMENT_DAY: {
    id: 'low_sentiment_day',
    title: 'Mood Pattern Detected',
    message: 'You tend to feel lower on {day}. Consider planning something uplifting for next {day}!',
    priority: 'medium',
    action: 'plan_activity'
  },
  MISSING_ENTRIES: {
    id: 'missing_entries',
    title: 'Keep Your Streak Going',
    message: 'You haven\'t journaled in {days} days. A quick 5-minute entry can help maintain your momentum!',
    priority: 'high',
    action: 'journal_now'
  },
  NEGATIVE_TREND: {
    id: 'negative_trend',
    title: 'Mood Trend Alert',
    message: 'Your mood has been declining recently. Consider reaching out to a friend or trying a relaxation technique.',
    priority: 'high',
    action: 'self_care'
  },
  POSITIVE_MOMENTUM: {
    id: 'positive_momentum',
    title: 'Great Progress!',
    message: 'Your mood has been improving! Keep up the great work with your journaling practice.',
    priority: 'low',
    action: 'celebrate'
  },
  WEEKEND_PATTERN: {
    id: 'weekend_pattern',
    title: 'Weekend Insight',
    message: 'You seem to feel {sentiment} on weekends. Consider planning activities that align with this pattern.',
    priority: 'medium',
    action: 'plan_weekend'
  },
  MORNING_VS_EVENING: {
    id: 'morning_evening',
    title: 'Time Pattern',
    message: 'You tend to feel {sentiment} in the {time}. Try journaling at your optimal time!',
    priority: 'low',
    action: 'optimize_timing'
  }
};

/**
 * Analyze temporal mood patterns to detect day-of-week trends
 */
async function analyzeDayOfWeekPatterns(userId) {
  try {
    const dayOfWeekData = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$processed_at' },
          avgSentiment: { $avg: '$sentiment.score' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gte: 2 } } // Only consider days with at least 2 entries
      },
      {
        $sort: { avgSentiment: 1 }
      }
    ]);

    if (dayOfWeekData.length === 0) return null;

    const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const lowestDay = dayOfWeekData[0];
    const highestDay = dayOfWeekData[dayOfWeekData.length - 1];

    // Check if there's a significant difference between lowest and highest days
    const sentimentDiff = highestDay.avgSentiment - lowestDay.avgSentiment;
    
    if (sentimentDiff > 0.3 && lowestDay.avgSentiment < -0.1) {
      return {
        type: NUDGE_TYPES.LOW_SENTIMENT_DAY,
        data: {
          day: dayNames[lowestDay._id],
          sentiment: lowestDay.avgSentiment
        }
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error analyzing day of week patterns: ${error}`);
    return null;
  }
}

/**
 * Check for missing journal entries and generate appropriate nudge
 */
async function checkMissingEntries(userId) {
  try {
    const lastEntry = await JournalEntries.findOne(
      { user_id: userId },
      { entry_date: 1 },
      { sort: { entry_date: -1 } }
    );

    if (!lastEntry) {
      return {
        type: NUDGE_TYPES.MISSING_ENTRIES,
        data: { days: 'many' }
      };
    }

    const daysSinceLastEntry = Math.floor((new Date() - lastEntry.entry_date) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry >= 3) {
      return {
        type: NUDGE_TYPES.MISSING_ENTRIES,
        data: { days: daysSinceLastEntry }
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error checking missing entries: ${error}`);
    return null;
  }
}

/**
 * Analyze recent mood trends for declining patterns
 */
async function analyzeMoodTrends(userId) {
  try {
    const recentTrends = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          processed_at: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } // Last 14 days
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$processed_at' }
          },
          avgSentiment: { $avg: '$sentiment.score' }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $limit: 7 // Last 7 days
      }
    ]);

    if (recentTrends.length < 3) return null;

    // Calculate trend direction
    const firstHalf = recentTrends.slice(0, Math.floor(recentTrends.length / 2));
    const secondHalf = recentTrends.slice(Math.floor(recentTrends.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.avgSentiment, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.avgSentiment, 0) / secondHalf.length;
    
    const trendDiff = secondHalfAvg - firstHalfAvg;

    if (trendDiff < -0.2) {
      return {
        type: NUDGE_TYPES.NEGATIVE_TREND,
        data: { trend: trendDiff }
      };
    } else if (trendDiff > 0.2) {
      return {
        type: NUDGE_TYPES.POSITIVE_MOMENTUM,
        data: { trend: trendDiff }
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error analyzing mood trends: ${error}`);
    return null;
  }
}

/**
 * Analyze weekend vs weekday patterns
 */
async function analyzeWeekendPatterns(userId) {
  try {
    const weekendData = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $in: [{ $dayOfWeek: '$processed_at' }, [1, 7]] }, // Sunday = 1, Saturday = 7
              'weekend',
              'weekday'
            ]
          },
          avgSentiment: { $avg: '$sentiment.score' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gte: 2 } }
      }
    ]);

    if (weekendData.length < 2) return null;

    const weekend = weekendData.find(d => d._id === 'weekend');
    const weekday = weekendData.find(d => d._id === 'weekday');

    if (!weekend || !weekday) return null;

    const sentimentDiff = weekend.avgSentiment - weekday.avgSentiment;
    
    if (Math.abs(sentimentDiff) > 0.2) {
      const sentiment = sentimentDiff > 0 ? 'more positive' : 'more negative';
      return {
        type: NUDGE_TYPES.WEEKEND_PATTERN,
        data: { sentiment, diff: sentimentDiff }
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error analyzing weekend patterns: ${error}`);
    return null;
  }
}

/**
 * Analyze morning vs evening patterns
 */
async function analyzeTimeOfDayPatterns(userId) {
  try {
    const timeData = await Insight.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: [{ $hour: '$processed_at' }, 12] },
              'morning',
              'evening'
            ]
          },
          avgSentiment: { $avg: '$sentiment.score' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gte: 2 } }
      }
    ]);

    if (timeData.length < 2) return null;

    const morning = timeData.find(d => d._id === 'morning');
    const evening = timeData.find(d => d._id === 'evening');

    if (!morning || !evening) return null;

    const sentimentDiff = morning.avgSentiment - evening.avgSentiment;
    
    if (Math.abs(sentimentDiff) > 0.15) {
      const betterTime = sentimentDiff > 0 ? 'morning' : 'evening';
      const sentiment = sentimentDiff > 0 ? 'more positive' : 'more negative';
      return {
        type: NUDGE_TYPES.MORNING_VS_EVENING,
        data: { time: betterTime, sentiment }
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error analyzing time of day patterns: ${error}`);
    return null;
  }
}

/**
 * Generate personalized nudge message
 */
function generateNudgeMessage(nudge) {
  if (!nudge || !nudge.type) return null;

  let message = nudge.type.message;
  
  // Replace placeholders with actual data
  if (nudge.data) {
    Object.keys(nudge.data).forEach(key => {
      const placeholder = `{${key}}`;
      message = message.replace(placeholder, nudge.data[key]);
    });
  }

  return {
    id: nudge.type.id,
    title: nudge.type.title,
    message,
    priority: nudge.type.priority,
    action: nudge.type.action,
    generatedAt: new Date()
  };
}

/**
 * Main function to generate nudges for a user
 */
export async function generateNudges(userId) {
  try {
    logger.info(`Generating nudges for user: ${userId}`);

    // Run all analysis functions in parallel
    const [
      dayOfWeekNudge,
      missingEntriesNudge,
      moodTrendNudge,
      weekendNudge,
      timeOfDayNudge
    ] = await Promise.all([
      analyzeDayOfWeekPatterns(userId),
      checkMissingEntries(userId),
      analyzeMoodTrends(userId),
      analyzeWeekendPatterns(userId),
      analyzeTimeOfDayPatterns(userId)
    ]);

    // Collect all non-null nudges
    const nudges = [
      dayOfWeekNudge,
      missingEntriesNudge,
      moodTrendNudge,
      weekendNudge,
      timeOfDayNudge
    ].filter(nudge => nudge !== null);

    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    nudges.sort((a, b) => {
      const aPriority = priorityOrder[a.type.priority] || 0;
      const bPriority = priorityOrder[b.type.priority] || 0;
      return bPriority - aPriority;
    });

    // Generate final nudge messages
    const finalNudges = nudges.map(generateNudgeMessage).filter(nudge => nudge !== null);

    // Return top 3 nudges to avoid overwhelming the user
    return finalNudges.slice(0, 3);

  } catch (error) {
    logger.error(`Error generating nudges: ${error}`);
    return [];
  }
}

export { NUDGE_TYPES };
