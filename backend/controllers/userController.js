import User from '../models/userModel.js';

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
