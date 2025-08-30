// Load environment variables from .env file
import 'dotenv/config';

import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../lib/logger.js';

// Access your API key as an environment variable
const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;

if (!API_KEY) {
  logger.error('GOOGLE_AI_STUDIO_API_KEY is not set in environment variables.');
  process.exit(1);
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

// For text-only input, use the gemma-3-12b-it model
const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

export default model;