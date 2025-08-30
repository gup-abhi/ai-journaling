import JournalTemplate from '../models/JournalTemplates.model.js';
import { templates } from './journalTemplates.js';
import connectDB from '../lib/mongo-connection.js';
import 'dotenv/config';
import logger from '../lib/logger.js';

await connectDB();
const templatesResponse = await JournalTemplate.insertMany(templates);
logger.info(`Templates added: ${templatesResponse}`);
process.exit(0);