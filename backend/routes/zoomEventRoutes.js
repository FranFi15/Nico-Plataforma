import express from 'express';
import {
  getZoomEvents,
  createZoomEvent,
  updateZoomEvent,
  deleteZoomEvent,
} from '../controllers/zoomEventController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getZoomEvents)
  .post(protect, admin, createZoomEvent);

router.route('/:id')
  .put(protect, admin, updateZoomEvent)
  .delete(protect, admin, deleteZoomEvent);

export default router;
