import mongoose from "mongoose";
import logger from './logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
