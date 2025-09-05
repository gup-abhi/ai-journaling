import User from "../models/Users.model.js";

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

  if (lastJournalDate && lastJournalDate.getTime() === today.getTime()) {
    return;
  }

  if (lastJournalDate && (today.getTime() - lastJournalDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
    user.streakData.currentStreak += 1;
  } else {
    user.streakData.currentStreak = 1;
  }

  if (user.streakData.currentStreak > user.streakData.longestStreak) {
    user.streakData.longestStreak = user.streakData.currentStreak;
  }

  user.streakData.lastJournalDate = today;
  user.journalingDays.set(today.toISOString().split('T')[0], true);

  await user.save();
};

export default calculateStreak;
