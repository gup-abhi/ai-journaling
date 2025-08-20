import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { createJournalEntry, getJournalEntries, getJournalEntryById } from '../controllers/journal.controller.js';

const router = express.Router();

router.post("/", validateToken, createJournalEntry);
router.get("/", validateToken, getJournalEntries);
router.get("/:id", validateToken, getJournalEntryById);

export default router;