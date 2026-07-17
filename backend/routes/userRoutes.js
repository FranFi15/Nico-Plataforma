import express from 'express';
import { getUsers, createUser, updateUserRole, updateUserMembership, markNotificationsRead } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers)
  .post(createUser);

router.put('/notifications/read', protect, markNotificationsRead);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

router.route('/:id/membership')
  .put(protect, admin, updateUserMembership);

// Protected route to retrieve authenticated user profile
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Perfil de usuario recuperado con éxito',
    data: req.user
  });
});

export default router;
