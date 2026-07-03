import User from '../models/userModel.js';

// @desc    Get all students
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('purchasedItems');

    res.status(200).json({
      success: true,
      message: 'Alumnos recuperados con éxito',
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
