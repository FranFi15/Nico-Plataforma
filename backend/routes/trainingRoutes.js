import express from 'express';
import {
  getTrainings,
  createTraining,
  deleteTraining,
  updateTraining,
  uploadPhoto,
  reorderTrainings,
} from '../controllers/trainingController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTrainings)
  .post(protect, admin, createTraining);

router.route('/reorder')
  .put(protect, admin, reorderTrainings);

router.route('/upload')
  .post(protect, admin, uploadPhoto);

router.route('/:id')
  .put(protect, admin, updateTraining)
  .delete(protect, admin, deleteTraining);

export default router;
