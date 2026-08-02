import express from 'express';
import {
  subscribeMercadoPago,
  checkoutMercadoPago,
  webhookMercadoPago,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to create subscription link
router.post('/subscribe', protect, subscribeMercadoPago);

// Route to create checkout preference for one-time purchases
router.post('/checkout', protect, checkoutMercadoPago);

// Asynchronous webhook for payment and subscription status notifications
router.post('/webhook', webhookMercadoPago);

export default router;
