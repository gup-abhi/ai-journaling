import JournalTemplate from '../models/JournalTemplates.model.js';
import { templates } from './journalTemplates.js';
import connectDB from '../lib/mongo-connection.js';
import 'dotenv/config';

await connectDB();
const templatesResponse = await JournalTemplate.insertMany(templates);
console.log("Templates added:", templatesResponse);
process.exit(0);