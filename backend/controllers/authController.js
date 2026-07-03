import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, membership } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Por favor, incluya nombre, correo electrónico y contraseña');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('El usuario ya existe');
    }

    // Create user (hashing occurs in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      membership: membership || 'free',
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membership: user.membership,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario no válidos');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Por favor, proporcione correo electrónico y contraseña');
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membership: user.membership,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error('Correo electrónico o contraseña no válidos');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('purchasedItems');

    if (user) {
      res.status(200).json({
        success: true,
        data: user,
      });
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    next(error);
  }
};
