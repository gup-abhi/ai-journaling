import mongoose from "mongoose";    

const journalEntrySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  entry_date: {
    type: Date,
    required: true
  },
  word_count: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);

export default JournalEntry;
