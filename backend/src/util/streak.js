import User from "../models/Users.model.js";
import JournalEntry from "../models/JournalEntries.model.js";

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

const calculateStreak = async (userId, entryDate = null) => {
  const user = await User.findById(userId);

  if (!user) {
    return;
  }

  // Use the entry date if provided, otherwise use today
  const journalDate = entryDate ? new Date(entryDate) : new Date();
  journalDate.setUTCHours(0, 0, 0, 0);

  const lastJournalDate = user.streakData.lastJournalDate ? new Date(user.streakData.lastJournalDate) : null;
  if (lastJournalDate) {
    lastJournalDate.setUTCHours(0, 0, 0, 0);
  }

  // Check if already journaled on this date
  const dateString = journalDate.toISOString().split('T')[0];
  if (user.journalingDays.get(dateString)) {
    return; // Already journaled on this date
  }

  // Add this journaling day
  user.journalingDays.set(dateString, true);
  user.streakData.lastJournalDate = journalDate;

  // Recalculate current streak based on journaling days
  const newStreak = calculateCurrentStreakFromDays(user.journalingDays);
  user.streakData.currentStreak = newStreak;

  // Update longest streak if needed
  if (user.streakData.currentStreak > user.streakData.longestStreak) {
    user.streakData.longestStreak = user.streakData.currentStreak;
  }

  await user.save();
};

// Function to populate journalingDays map for existing journal entries
export const populateJournalingDays = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    return;
  }

  // Get all journal entries for this user
  const journalEntries = await JournalEntry.find({ user_id: userId });
  
  // Clear existing journalingDays map
  user.journalingDays = new Map();
  
  // Add each journal entry date to the map
  journalEntries.forEach(entry => {
    const entryDate = new Date(entry.entry_date);
    entryDate.setUTCHours(0, 0, 0, 0);
    const dateString = entryDate.toISOString().split('T')[0];
    user.journalingDays.set(dateString, true);
  });
  
  // Recalculate streak data
  const newStreak = calculateCurrentStreakFromDays(user.journalingDays);
  user.streakData.currentStreak = newStreak;
  
  // Update longest streak if needed
  if (user.streakData.currentStreak > user.streakData.longestStreak) {
    user.streakData.longestStreak = user.streakData.currentStreak;
  }
  
  // Update last journal date
  if (journalEntries.length > 0) {
    const lastEntry = journalEntries.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))[0];
    user.streakData.lastJournalDate = new Date(lastEntry.entry_date);
  }
  
  await user.save();
  console.log(`Populated journaling days for user ${userId}: ${user.journalingDays.size} days`);
};

export default calculateStreak;
