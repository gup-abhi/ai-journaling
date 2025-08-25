import mongoose from "mongoose";
import GoalTracking from "../models/GoalTracking.model.js";
import AppError from "../util/AppError.js";

export const createGoal = async (req, res) => {
    const { name, progress, description } = req.body;
    const { user_id } = req.cookies;

    if (!name) throw new AppError("Goal name is required", 400);
    if (!progress) throw new AppError("Progress is required", 400);

    try {
        const newGoal = new GoalTracking({
            user_id,
            name,
            progress,
            description
        });

        await newGoal.save();
        res.status(201).json({ message: "Goal created successfully", newGoal });
    } catch (error) {
        console.error("Error creating goal:", error);
        throw new AppError("Error creating goal", 500);
    }
};


export const updateGoal = async (req, res) => {
    const { id } = req.params;
    const { progress } = req.body;

    if (!id) throw new AppError("Goal ID is required", 400);

    if (!progress) throw new AppError("Progress is required", 400);

    try {
        const updatedGoal = await GoalTracking.findByIdAndUpdate(
            id,
            { progress },
            { new: true }
        );

        if (!updatedGoal) throw new AppError("Goal not found", 404);

        res.status(200).json({ message: "Goal updated successfully", updatedGoal });
    } catch (error) {
        console.error("Error updating goal:", error);
        throw new AppError("Error updating goal", 500);
    }
};


export const deleteGoal = async (req, res) => {
    const { id } = req.params;

    if (!id) throw new AppError("Goal ID is required", 400);

    try {
        const deletedGoal = await GoalTracking.findByIdAndDelete(id);

        if (!deletedGoal) throw new AppError("Goal not found", 404);

        res.status(200).json({ message: "Goal deleted successfully", deletedGoal });
    } catch (error) {
        console.error("Error deleting goal:", error);
        throw new AppError("Error deleting goal", 500);
    }
};


export const getGoal = async (req, res) => {
    const { id } = req.params;

    if (!id) throw new AppError("Goal ID is required", 400);

    try {
        const goal = await GoalTracking.findById(id);

        if (!goal) throw new AppError("Goal not found", 404);

        res.status(200).json(goal);
    } catch (error) {
        console.error("Error fetching goal:", error);
        throw new AppError("Error fetching goal", 500);
    }
};


export const getGoals = async (req, res) => {
    const { user_id } = req.cookies;
    const { progress } = req.query;

    try {
        // Base query
        const query = { user_id };

        // Add progress filter only if provided
        if (progress) {
            query.progress = progress;
        }

        const goals = await GoalTracking.find(query);

        res.status(200).json({ goals });
    } catch (error) {
        console.error("Error fetching goals:", error);
        throw new AppError("Error fetching goals", 500);
    }
};


export const getActiveGoals = async (req, res) => {
    const { user_id } = req.cookies;

    try {
        const goals = await GoalTracking.find({ user_id, progress: "in-progress" });

        res.status(200).json({ goals });
    } catch (error) {
        console.error("Error fetching active goals:", error);
        throw new AppError("Error fetching active goals", 500);
    }
};