import User from '../models/userModel.js';
import { sendMembershipSubscribedEmail, sendMembershipCancelledEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';

// @desc    Get all users (students, professors, admins)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const students = await User.find()
      .select('-password')
      .populate('purchasedItems')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Usuarios recuperados con éxito',
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Por favor, proporcione todos los campos obligatorios (nombre, correo electrónico, contraseña)');
    }

    res.status(201).json({
      success: true,
      message: 'Usuario creado con éxito',
      data: { name, email }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    if (role) user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Rol de usuario actualizado con éxito',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user membership and expiration date
// @route   PUT /api/users/:id/membership
// @access  Private/Admin
export const updateUserMembership = async (req, res, next) => {
  try {
    const { membership, isSubscribed, membershipExpiresAt } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    let membershipChangedToPremium = false;
    let membershipChangedToFree = false;

    if (membership !== undefined) {
      if (membership === 'premium' && user.membership !== 'premium') {
        user.premiumSince = new Date();
        membershipChangedToPremium = true;
      } else if (membership === 'free' && user.membership === 'premium') {
        membershipChangedToFree = true;
      }
      user.membership = membership;
    }
    if (isSubscribed !== undefined) user.isSubscribed = isSubscribed;
    if (membershipExpiresAt !== undefined) {
      user.membershipExpiresAt = membershipExpiresAt ? new Date(membershipExpiresAt) : null;
    }

    const updatedUser = await user.save();

    // Send async emails
    if (membershipChangedToPremium) {
      sendMembershipSubscribedEmail(updatedUser).catch(console.error);
    } else if (membershipChangedToFree) {
      sendMembershipCancelledEmail(updatedUser).catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: 'Membresía de usuario actualizada con éxito',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark user notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    user.notifications = user.notifications.map((n) => {
      n.read = true;
      return n;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notificaciones marcadas como leídas',
      data: user.notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('No se puede eliminar a un administrador');
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado con éxito'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400);
      throw new Error('Por favor, proporciona un correo electrónico');
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Devolvemos success igual por seguridad para no revelar correos registrados
      return res.status(200).json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (15 minutes)
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user, resetUrl);

      res.status(200).json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace de recuperación.',
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500);
      throw new Error('Error enviando el correo electrónico de recuperación');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('El token de recuperación es inválido o ha expirado');
    }

    // Set new password
    if (!req.body.password || req.body.password.length < 6) {
      res.status(400);
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada con éxito',
    });
  } catch (error) {
    next(error);
  }
};
