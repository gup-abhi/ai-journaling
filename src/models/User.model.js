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
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
