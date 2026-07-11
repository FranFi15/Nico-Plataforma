import express from 'express';
import { registerUser, loginUser, getMe, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Secure route to fetch and update active user profile details
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

export default router;
