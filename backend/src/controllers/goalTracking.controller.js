import mongoose from "mongoose";
import GoalTracking from "../models/GoalTracking.model.js";

export const createGoal = async (req, res) => {
    const { name, progress, description } = req.body;
    const { user_id } = req.cookies;

    if (!name) return res.status(400).json({ error: "Goal name is required" });
    if (!progress) return res.status(400).json({ error: "Progress is required" });

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
        res.status(500).json({ message: "Error creating goal", error });
    }
};


export const updateGoal = async (req, res) => {
    const { id } = req.params;
    const { progress } = req.body;

    if (!id) return res.status(400).json({ error: "Goal ID is required" });

    if (!progress) return res.status(400).json({ error: "Progress is required" });

    try {
        const updatedGoal = await GoalTracking.findByIdAndUpdate(
            id,
            { progress },
            { new: true }
        );

        if (!updatedGoal) return res.status(404).json({ error: "Goal not found" });

        res.status(200).json({ message: "Goal updated successfully", updatedGoal });
    } catch (error) {
        console.error("Error updating goal:", error);
        res.status(500).json({ error });
    }
};


export const deleteGoal = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Goal ID is required" });

    try {
        const deletedGoal = await GoalTracking.findByIdAndDelete(id);

        if (!deletedGoal) return res.status(404).json({ error: "Goal not found" });

        res.status(200).json({ message: "Goal deleted successfully", deletedGoal });
    } catch (error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ error });
    }
};


export const getGoal = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Goal ID is required" });

    try {
        const goal = await GoalTracking.findById(id);

        if (!goal) return res.status(404).json({ error: "Goal not found" });

        res.status(200).json(goal);
    } catch (error) {
        console.error("Error fetching goal:", error);
        res.status(500).json({ error });
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
        res.status(500).json({ error });
    }
};


export const getActiveGoals = async (req, res) => {
    const { user_id } = req.cookies;

    try {
        const goals = await GoalTracking.find({ user_id, progress: "in-progress" });

        res.status(200).json({ goals });
    } catch (error) {
        console.error("Error fetching active goals:", error);
        res.status(500).json({ error });
    }
};