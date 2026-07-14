import express from 'express';
import {
  getBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit
} from '../controllers/benefitController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBenefits)
  .post(protect, admin, createBenefit);

router.route('/:id')
  .put(protect, admin, updateBenefit)
  .delete(protect, admin, deleteBenefit);

export default router;
