import express from 'express';
import {
  getHomeAthletes,
  createHomeAthlete,
  updateHomeAthlete,
  deleteHomeAthlete,
  reorderHomeAthletes,
} from '../controllers/homeAthleteController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getHomeAthletes)
  .post(protect, admin, createHomeAthlete);

router.route('/reorder')
  .put(protect, admin, reorderHomeAthletes);

router.route('/:id')
  .put(protect, admin, updateHomeAthlete)
  .delete(protect, admin, deleteHomeAthlete);

export default router;
