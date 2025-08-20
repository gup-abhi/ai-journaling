import express from 'express';
import { signUpUser, loginUser, logoutUser, checkAuth } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUpUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/check', checkAuth);

export default router;
