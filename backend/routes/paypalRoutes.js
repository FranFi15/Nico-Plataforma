import express from 'express';
import {
  subscribePayPal,
  checkoutPayPal,
  webhookPayPal,
} from '../controllers/paypalController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to create subscription link
router.post('/subscribe', protect, subscribePayPal);

// Route to create checkout link for one-time purchases
router.post('/checkout', protect, checkoutPayPal);

// Asynchronous webhook for payment capture and subscription notifications
router.post('/webhook', webhookPayPal);

export default router;
