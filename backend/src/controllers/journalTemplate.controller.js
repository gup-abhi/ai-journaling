import JournalTemplate from '../models/JournalTemplates.model.js';
import AppError from "../util/AppError.js";

export const getAllJournalTemplates = async (req, res) => {
  try {
    const templates = await JournalTemplate.find();

    if (templates.length === 0) {
      throw new AppError("No templates found", 404);
    }

    res.status(200).json(templates);
  } catch (error) {
    console.error("Error fetching journal templates:", error);
    throw new AppError("Internal server error", 500);
  }
};

export const getJournalTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await JournalTemplate.findById(id);
    if (!template) {
      throw new AppError("Template not found", 404);
    }
    res.status(200).json(template);
  } catch (error) {
    console.error("Error fetching journal template:", error);
    throw new AppError("Internal server error", 500);
  }
};
