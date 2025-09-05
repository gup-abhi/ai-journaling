import mongoose from 'mongoose';
import User from '../models/Users.model.js';
import JournalEntry from '../models/JournalEntries.model.js';
import connectDB from '../lib/mongo-connection.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const migrateStreaks = async () => {
  await connectDB();

  const users = await User.find();

  for (const user of users) {
    const journalEntries = await JournalEntry.find({ user_id: user._id }).sort({ entry_date: 1 });

    if (journalEntries.length === 0) {
      continue;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let lastJournalDate = null;
    const journalingDays = new Map();

    for (const entry of journalEntries) {
      const entryDate = new Date(entry.entry_date);
      entryDate.setUTCHours(0, 0, 0, 0);

      if (lastJournalDate) {
        const diffDays = (entryDate.getTime() - lastJournalDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      lastJournalDate = entryDate;
      journalingDays.set(entryDate.toISOString().split('T')[0], true);
    }

    user.streakData.currentStreak = currentStreak;
    user.streakData.longestStreak = longestStreak;
    user.streakData.lastJournalDate = lastJournalDate;
    user.journalingDays = journalingDays;

    await user.save();
    console.log(`Streak data updated for user ${user.email}`);
  }

  await mongoose.disconnect();
  console.log('Streak migration complete.');
};

migrateStreaks();
