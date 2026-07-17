import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Content from '../models/contentModel.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from format: Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in database and attach to request object, excluding password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('No autorizado, usuario no encontrado'));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('No autorizado, token no válido'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('No autorizado, no se proporcionó ningún token'));
  }
};

// Middleware to restrict access to admin users only
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('No autorizado como administrador'));
  }
};

// Middleware to verify content viewing permissions
export const checkAccess = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      res.status(404);
      return next(new Error('Contenido no encontrado'));
    }

    // Admins and Professors bypass all access rules
    if (req.user && ['admin', 'professor', 'profe', 'instructor'].includes(req.user.role)) {
      return next();
    }

    // If content is draft, non-privileged users cannot access it
    if (content.isPublished === false || content.status === 'draft') {
      res.status(403);
      return next(new Error('Este contenido está en borrador y no está disponible públicamente aún.'));
    }

    // Cursos and Workshops require login even if they are free
    if (content.contentType === 'course' || content.contentType === 'workshop') {
      if (!req.user) {
        res.status(401);
        return next(new Error('Debes iniciar sesión para acceder a este contenido.'));
      }
    }

    // Access rule: Free content is public
    if (content.accessType === 'free') {
      return next();
    }

    // Access rule: Subscription requires premium membership
    if (content.accessType === 'subscription') {
      const isPremiumUser = req.user && (req.user.membership === 'premium' || req.user.isSubscribed === true);
      const isExpired = req.user && req.user.membershipExpiresAt && new Date(req.user.membershipExpiresAt) < new Date();
      if (isPremiumUser && !isExpired) {
        return next();
      } else {
        res.status(403);
        return next(new Error('Acceso denegado. Este contenido requiere una suscripción o membresía activa no expirada.'));
      }
    }

    // Access rule: One-time-purchase requires content ID in purchasedItems
    if (content.accessType === 'one-time-purchase') {
      if (
        req.user &&
        req.user.purchasedItems &&
        req.user.purchasedItems.includes(content._id)
      ) {
        return next();
      } else {
        res.status(403);
        return next(new Error('Acceso denegado. Este contenido requiere ser comprado previamente.'));
      }
    }

    res.status(400);
    return next(new Error('Tipo de acceso no válido para este contenido'));
  } catch (error) {
    res.status(500);
    return next(error);
  }
};

// Optional auth middleware that sets req.user if a valid token is present, but doesn't block guests
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      console.log('Optional authentication token verification failed');
    }
  }

  next();
};

