import User from "../models/Users.model.js";
import AppError from "../util/AppError.js";
import logger from '../lib/logger.js';

// Helper function to recalculate current streak based on current date
const recalculateCurrentStreak = (streakData, journalingDays) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const lastJournalDate = streakData.lastJournalDate ? new Date(streakData.lastJournalDate) : null;
  if (!lastJournalDate) {
    return streakData; // No journal entries yet
  }

  lastJournalDate.setUTCHours(0, 0, 0, 0);

  // If last journal was today, streak is still active
  if (lastJournalDate.getTime() === today.getTime()) {
    return streakData;
  }

  const diffDays = Math.round((today - lastJournalDate) / (1000 * 60 * 60 * 24));

  // If it's been more than 1 day since last journal, streak is broken
  if (diffDays > 1) {
    streakData.currentStreak = 0;
    logger.info(`Streak broken for user - ${diffDays} days since last journal`);
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

    // Recalculate current streak based on current date
    const updatedStreakData = recalculateCurrentStreak(user.streakData, user.journalingDays);

    // Save updated streak data if it changed
    if (updatedStreakData.currentStreak !== user.streakData.currentStreak) {
      user.streakData = updatedStreakData;
      await user.save();
      logger.info(`Updated streak data for user ${user_id}: currentStreak = ${updatedStreakData.currentStreak}`);
    }

    return res.status(200).json({
      streakData: updatedStreakData,
      journalingDays: user.journalingDays,
    });
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};
