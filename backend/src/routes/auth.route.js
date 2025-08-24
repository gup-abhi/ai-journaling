import express from 'express';
import { signUpUser, loginUser, logoutUser, checkAuth, getUserDetails, loginWithGoogle, googleCallback } from '../controllers/auth.controller.js';
import { validateToken } from '../middlewares/authorization.js';

const router = express.Router();

router.post('/signup', signUpUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/check', checkAuth);
router.get('/user', validateToken, getUserDetails);
router.get('/google/callback', googleCallback);
router.get('/google/login', loginWithGoogle);

export default router;
