import express from 'express';
import { validateToken } from '../middlewares/authorization.js';
import { createJournalEntry, getJournalEntries, getJournalEntryById, getTotalJournalEntries, getTotalMonthJournalEntries } from '../controllers/journal.controller.js';

const router = express.Router();

router.post("/", validateToken, createJournalEntry);
router.get("/", validateToken, getJournalEntries);
router.get("/total-entries", validateToken, getTotalJournalEntries);
router.get("/total-month-entries", validateToken, getTotalMonthJournalEntries);
router.get("/:id", validateToken, getJournalEntryById);

export default router;