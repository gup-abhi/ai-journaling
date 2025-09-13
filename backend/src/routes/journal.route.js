import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { createJournalEntry, getJournalEntries, getPaginatedJournalEntries, getJournalEntryById, getTotalJournalEntries, getTotalMonthJournalEntries, getTimelineData, getJournalEntriesByTheme } from '../controllers/journal.controller.js';

const router = express.Router();

router.post("/", validateToken, createJournalEntry);
router.get("/", validateToken, getJournalEntries);
router.get("/paginated", validateToken, getPaginatedJournalEntries);
router.get("/total-entries", validateToken, getTotalJournalEntries);
router.get("/total-monthly-entries", validateToken, getTotalMonthJournalEntries);
router.get("/timeline", validateToken, getTimelineData);
router.get("/by-theme", validateToken, getJournalEntriesByTheme);
router.get("/:id", validateToken, getJournalEntryById);

export default router;