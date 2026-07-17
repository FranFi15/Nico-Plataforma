import express from 'express';
import { getSubscriptionPlan, updateSubscriptionPlan } from '../controllers/subscriptionPlanController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getSubscriptionPlan);
router.put('/', protect, admin, updateSubscriptionPlan);

export default router;
