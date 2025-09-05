import User from "../models/Users.model.js";
import logger from "../lib/logger.js";

const calculateStreak = async (userId) => {
  logger.info(`Calculating streak for user: ${userId}`);
  const user = await User.findById(userId);

  if (!user) {
    logger.warn(`User not found: ${userId}`);
    return;
  }
  logger.info(`Initial streak data: ${JSON.stringify(user.streakData)}`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  logger.info(`Today's date (UTC): ${today.toISOString()}`);

  const lastJournalDate = user.streakData.lastJournalDate ? new Date(user.streakData.lastJournalDate) : null;
  if (lastJournalDate) {
    lastJournalDate.setUTCHours(0, 0, 0, 0);
    logger.info(`Last journal date (UTC): ${lastJournalDate.toISOString()}`);
  } else {
    logger.info("No previous journal entry found.");
  }

  if (lastJournalDate && lastJournalDate.getTime() === today.getTime()) {
    logger.info("Journal entry already made today. Streak not updated.");
    return;
  }

  let diffDays = lastJournalDate 
      ? Math.round((today - lastJournalDate) / (1000 * 60 * 60 * 24)) 
      : 1;

  if (diffDays === 1) {
    user.streakData.currentStreak += 1;
    logger.info("Streak incremented.");
  } else {
    user.streakData.currentStreak = 1;
    logger.info("Streak reset.");
  }

  if (user.streakData.currentStreak > user.streakData.longestStreak) {
    user.streakData.longestStreak = user.streakData.currentStreak;
    logger.info("Longest streak updated.");
  }

  user.streakData.lastJournalDate = today;
  const todayString = today.toISOString().split('T')[0];
  user.journalingDays.set(todayString, true);

  await user.save();
  logger.info(`Streak data updated for user: ${userId}`);
  logger.info(`Current streak: ${user.streakData.currentStreak}, Longest streak: ${user.streakData.longestStreak}`);
};

export default calculateStreak;
