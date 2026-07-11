import express from 'express';
import {
  getContents,
  createContent,
  getContentById,
  checkoutContent,
  updateContent,
  deleteContent,
  createContentReview,
  uploadContentFile,
} from '../controllers/contentController.js';
import { protect, admin, checkAccess, optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/upload-file')
  .post(protect, admin, uploadContentFile);

router.route('/')
  .get(getContents)
  .post(protect, admin, createContent);

// Route to create a review on content
router.route('/:id/reviews')
  .post(protect, createContentReview);

// Route to get specific content details (protected by access checks)
router.route('/:id')
  .get(optionalProtect, checkAccess, getContentById)
  .put(protect, admin, updateContent)
  .delete(protect, admin, deleteContent);

// Route to simulate purchase of content (checkout)
router.route('/:id/checkout')
  .post(protect, checkoutContent);

export default router;
