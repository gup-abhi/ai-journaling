import JournalTemplate from '../models/JournalTemplates.model.js';

export const getAllJournalTemplates = async (req, res) => {
  try {
    const templates = await JournalTemplate.find();

    if (templates.length === 0) {
      return res.status(404).json({ message: "No templates found" });
    }

    res.status(200).json(templates);
  } catch (error) {
    console.error("Error fetching journal templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJournalTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await JournalTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error("Error fetching journal template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
