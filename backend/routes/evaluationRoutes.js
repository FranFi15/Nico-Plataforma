import express from 'express';
import {
  getEvaluationConfig,
  updateEvaluationConfig,
  uploadPdfFile,
  downloadEvaluationPdf,
} from '../controllers/evaluationController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/download', downloadEvaluationPdf);

router.route('/')
  .get(getEvaluationConfig)
  .put(protect, admin, updateEvaluationConfig);

router.route('/upload-pdf')
  .post(protect, admin, uploadPdfFile);

export default router;
