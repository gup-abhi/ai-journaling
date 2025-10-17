import GoalTracking from '../models/GoalTracking.model.js';
import logger from '../lib/logger.js';
import { findBestMatch } from 'string-similarity';

const SIMILARITY_THRESHOLD = 0.8;

const updateGoalsFromInsights = async (userId, goals) => {
  if (!goals || goals.length === 0) {
    return;
  }

  const existingGoals = await GoalTracking.find({ user_id: userId });
  const existingGoalNames = existingGoals.map(g => g.name);

  for (const goal of goals) {
    try {
      let bestMatch = null;
      if (existingGoalNames.length > 0) {
        const matches = findBestMatch(goal.goal, existingGoalNames);
        if (matches.bestMatch.rating > SIMILARITY_THRESHOLD) {
          bestMatch = existingGoals.find(g => g.name === matches.bestMatch.target);
        }
      }

      if (bestMatch) {
        bestMatch.progress = goal.status;
        bestMatch.description = goal.progress_indicator;
        await bestMatch.save();
        logger.info(`Goal '${goal.goal}' updated for user ${userId} (matched with '${bestMatch.name}')`);
      } else {
        const newGoal = new GoalTracking({
          user_id: userId,
          name: goal.goal,
          progress: goal.status,
          description: goal.progress_indicator,
        });
        await newGoal.save();
        logger.info(`New goal '${goal.goal}' created for user ${userId}`);
      }
    } catch (error) {
      logger.error(`Error updating or creating goal '${goal.goal}' for user ${userId}: ${error}`);
    }
  }
};

export default updateGoalsFromInsights;
