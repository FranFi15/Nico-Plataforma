import express from 'express';
import { getPlatformStats } from '../controllers/statsController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getPlatformStats);

export default router;
