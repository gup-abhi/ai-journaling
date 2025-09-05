import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth_uid: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  last_login_at: {
    type: Date,
    default: Date.now
  },
  display_name: {
    type: String,
    required: true
  },
  streakData: {
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
      comment: "Number of consecutive days the user has journaled."
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
      comment: "The longest streak achieved by the user."
    },
    lastJournalDate: {
      type: Date,
      default: null,
      comment: "The UTC date of the last journal entry. Used for calculating streak continuity."
    }
  },
  journalingDays: {
    type: Map,
    of: Boolean,
    default: new Map(),
    comment: "Map of YYYY-MM-DD strings to boolean, indicating a journaling day. For efficient lookup."
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
