export const parseTextToJSON = (text) => {
  // 1. Strip markdown fences ```json ... ```
  const cleaned = text.replace(/```json|```/g, "").trim();

  // 2. Parse JSON
  const parsed = JSON.parse(cleaned);

  return parsed;
};
