import express from 'express';
import { signUpUser, loginUser, logoutUser, checkAuth, getUserDetails, loginWithGoogle, googleCallback, refreshTokenMobile } from '../controllers/auth.controller.js';
import { validateToken } from '../middlewares/authorization.js';

const router = express.Router();

router.post('/signup', signUpUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/token-refresh-mobile', refreshTokenMobile);
router.get('/google/callback', googleCallback);
router.get('/google/login', loginWithGoogle);
router.get('/check', validateToken, checkAuth);
router.get('/user', validateToken, getUserDetails);

export default router;
