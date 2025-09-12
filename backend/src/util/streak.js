import User from "../models/Users.model.js";

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

const calculateStreak = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const lastJournalDate = user.streakData.lastJournalDate ? new Date(user.streakData.lastJournalDate) : null;
  if (lastJournalDate) {
    lastJournalDate.setUTCHours(0, 0, 0, 0);
  }

  // Check if already journaled today
  const todayString = today.toISOString().split('T')[0];
  if (user.journalingDays.get(todayString)) {
    return; // Already journaled today
  }

  // Add today's journaling day
  user.journalingDays.set(todayString, true);
  user.streakData.lastJournalDate = today;

  // Recalculate current streak based on journaling days
  const newStreak = calculateCurrentStreakFromDays(user.journalingDays);
  user.streakData.currentStreak = newStreak;

  // Update longest streak if needed
  if (user.streakData.currentStreak > user.streakData.longestStreak) {
    user.streakData.longestStreak = user.streakData.currentStreak;
  }

  await user.save();
};

export default calculateStreak;
