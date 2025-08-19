export function countWords(str) {
  if (!str) return 0;

  // Split by spaces, tabs, or newlines, filter out empty strings
  const words = str.trim().split(/\s+/);
  return words.length;
}