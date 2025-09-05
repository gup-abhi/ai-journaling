import User from "../models/Users.model.js";
import AppError from "../util/AppError.js";
import logger from '../lib/logger.js';

export const getStreakData = async (req, res) => {
  const { _id: user_id } = req.user;

  try {
    const user = await User.findById(user_id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return res.status(200).json(user.streakData);
  } catch (error) {
    logger.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};
