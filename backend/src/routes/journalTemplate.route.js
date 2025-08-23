import express from 'express';
import { getAllJournalTemplates, getJournalTemplateById } from '../controllers/journalTemplate.controller.js';

const router = express.Router();

router.get('/', getAllJournalTemplates);
router.get('/:id', getJournalTemplateById);

export default router;
