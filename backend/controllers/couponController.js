import Coupon from '../models/couponModel.js';

// @desc    Obtener todos los cupones
// @route   GET /api/coupons
// @access  Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('applicableCourses', 'title').sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear un nuevo cupón de descuento para cursos
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, applyToAll, applicableCourses, active } = req.body;

    if (!code || !discountPercentage) {
      return res.status(400).json({ message: 'Por favor ingresa el código y el porcentaje de descuento.' });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return res.status(400).json({ message: 'Ese código de descuento ya existe.' });
    }

    const coupon = new Coupon({
      code: uppercaseCode,
      discountPercentage,
      applyToAll: applyToAll !== undefined ? applyToAll : true,
      applicableCourses: applicableCourses || [],
      active: active !== undefined ? active : true
    });

    const createdCoupon = await coupon.save();
    const populated = await Coupon.findById(createdCoupon._id).populate('applicableCourses', 'title');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar cupón de descuento
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, applyToAll, applicableCourses, active } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      if (code && code.toUpperCase().trim() !== coupon.code) {
        const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
          return res.status(400).json({ message: 'Ese código ya está en uso por otro cupón.' });
        }
        coupon.code = code.toUpperCase().trim();
      }

      if (discountPercentage !== undefined) coupon.discountPercentage = discountPercentage;
      if (applyToAll !== undefined) coupon.applyToAll = applyToAll;
      if (applicableCourses !== undefined) coupon.applicableCourses = applicableCourses;
      if (active !== undefined) coupon.active = active;

      const updatedCoupon = await coupon.save();
      const populated = await Coupon.findById(updatedCoupon._id).populate('applicableCourses', 'title');
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Cupón no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar cupón de descuento
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.deleteOne({ _id: req.params.id });
      res.json({ message: 'Cupón eliminado' });
    } else {
      res.status(404).json({ message: 'Cupón no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validar cupón para un curso específico
// @route   POST /api/coupons/validate
// @access  Public / Authenticated
export const validateCoupon = async (req, res) => {
  try {
    const { code, courseId } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Por favor ingresa un código para validar.' });
    }

    const uppercaseCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: uppercaseCode, active: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Código de descuento inválido o expirado.' });
    }

    // Si no aplica a todos los cursos, chequear si el courseId está en applicableCourses
    if (!coupon.applyToAll && courseId) {
      const applies = coupon.applicableCourses.some(id => id.toString() === courseId.toString());
      if (!applies) {
        return res.status(400).json({ message: 'Este cupón no es válido para este curso en específico.' });
      }
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      _id: coupon._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
