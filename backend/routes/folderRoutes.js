import express from 'express';
import {
  getFolders,
  createFolder,
  deleteFolder,
  addItemToFolder,
  removeItemFromFolder,
} from '../controllers/folderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFolders)
  .post(protect, createFolder);

router.route('/:id')
  .delete(protect, deleteFolder);

router.route('/:id/items')
  .post(protect, addItemToFolder);

router.route('/:id/items/:contentId')
  .delete(protect, removeItemFromFolder);

export default router;
