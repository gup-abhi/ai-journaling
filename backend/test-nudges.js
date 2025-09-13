// Simple test script to verify nudge engine functionality
import { generateNudges } from './src/util/nudgeEngine.js';

// Mock user ID for testing
const testUserId = '507f1f77bcf86cd799439011'; // Example ObjectId

console.log('Testing nudge engine...');
console.log('User ID:', testUserId);

try {
  const nudges = await generateNudges(testUserId);
  console.log('Generated nudges:', JSON.stringify(nudges, null, 2));
} catch (error) {
  console.error('Error testing nudge engine:', error);
}
