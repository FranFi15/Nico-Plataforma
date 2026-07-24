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
  notifyStudents,
  enrollInContent,
  certifyKinvent,
  getKinventCertifications,
  toggleKinventCertificationStatus
} from '../controllers/contentController.js';
import { protect, admin, checkAccess, optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/upload-file')
  .post(protect, admin, uploadContentFile);

router.route('/')
  .get(optionalProtect, getContents)
  .post(protect, admin, createContent);

// Route to notify students of a new module/lesson
router.post('/:id/notify-students', protect, admin, notifyStudents);

// Kinvent Certification Routes
router.route('/kinvent-certifications')
  .get(protect, admin, getKinventCertifications);

router.route('/kinvent-certifications/:id')
  .put(protect, admin, toggleKinventCertificationStatus);

router.post('/:id/kinvent-certify', protect, certifyKinvent);

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

// Route to enroll student in free or accessible content
router.post('/:id/enroll', protect, enrollInContent);

export default router;
