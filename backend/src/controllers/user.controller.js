import User from "../models/Users.model.js";
import AppError from "../util/AppError.js";
import logger from '../lib/logger.js';
import { populateJournalingDays as populateJournalingDaysUtil } from "../util/streak.js";

// Helper function to calculate current streak based on journaling days
const calculateCurrentStreakFromDays = (journalingDays) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  // Check consecutive days backwards from today
  while (true) {
    const dateString = checkDate.toISOString().split('T')[0];
    if (journalingDays.get(dateString)) {
      streak++;
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
};

// Helper function to recalculate current streak based on current date
const recalculateCurrentStreak = (streakData, journalingDays) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Use journaling days to accurately calculate current streak
  const actualCurrentStreak = calculateCurrentStreakFromDays(journalingDays);

  // If the calculated streak is different from stored streak, update it
  if (actualCurrentStreak !== streakData.currentStreak) {
    streakData.currentStreak = actualCurrentStreak;
    logger.info(`Recalculated current streak: ${actualCurrentStreak}`);
  }

  return streakData;
};

export const getStreakData = async (req, res) => {
  const { _id: user_id } = req.user;

  try {
    const user = await User.findById(user_id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // If journalingDays map is empty, populate it from existing journal entries
    if (!user.journalingDays || user.journalingDays.size === 0) {
      logger.info(`Journaling days map is empty for user ${user_id}, populating from existing entries`);
      await populateJournalingDaysUtil(user_id);
      // Refresh user data after population
      const refreshedUser = await User.findById(user_id);
      user.journalingDays = refreshedUser.journalingDays;
      user.streakData = refreshedUser.streakData;
    }

    // Recalculate current streak based on current date
    const updatedStreakData = recalculateCurrentStreak(user.streakData, user.journalingDays);

    // Save updated streak data if it changed (e.g., streak was broken)
    if (updatedStreakData.currentStreak !== user.streakData.currentStreak) {
      user.streakData = updatedStreakData;
      await user.save();
      logger.info(`Updated streak data for user ${user_id}: currentStreak = ${updatedStreakData.currentStreak}`);
    }

    // Convert Map to plain object for JSON serialization
    const journalingDaysObject = {};
    if (user.journalingDays && user.journalingDays instanceof Map) {
      user.journalingDays.forEach((value, key) => {
        journalingDaysObject[key] = value;
      });
    }

    logger.info(`Sending journaling days for user ${user_id}: ${Object.keys(journalingDaysObject).length} days`);

    return res.status(200).json({
      streakData: updatedStreakData,
      journalingDays: journalingDaysObject,
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

export const populateJournalingDays = async (req, res) => {
  const { _id: user_id } = req.user;

  try {
    await populateJournalingDaysUtil(user_id);
    return res.status(200).json({ message: "Journaling days populated successfully" });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};
