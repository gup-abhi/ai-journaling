import express from 'express';
import { signUpUser, loginUser, logoutUser, checkAuth, getUserDetails, loginWithGoogle, googleCallback, testMobileDetection } from '../controllers/auth.controller.js';
import { validateToken } from '../middlewares/authorization.js';

const router = express.Router();

router.post('/signup', signUpUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/google/callback', googleCallback);
router.get('/google/login', loginWithGoogle);
router.get('/check', validateToken, checkAuth);
router.get('/user', validateToken, getUserDetails);
router.get('/test-mobile', testMobileDetection);

export default router;
