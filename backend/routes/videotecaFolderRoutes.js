import express from 'express';
import {
  getVideoFolders,
  createVideoFolder,
  updateVideoFolder,
  deleteVideoFolder,
} from '../controllers/videotecaFolderController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getVideoFolders)
  .post(protect, admin, createVideoFolder);

router.route('/:id')
  .put(protect, admin, updateVideoFolder)
  .delete(protect, admin, deleteVideoFolder);

export default router;
