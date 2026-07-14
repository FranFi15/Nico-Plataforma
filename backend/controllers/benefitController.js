import Benefit from '../models/benefitModel.js';

// @desc    Obtener todos los beneficios de locales
// @route   GET /api/benefits
// @access  Public / Members / Admin
export const getBenefits = async (req, res) => {
  try {
    const benefits = await Benefit.find().sort({ createdAt: -1 });
    res.json(benefits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear un nuevo beneficio de local
// @route   POST /api/benefits
// @access  Admin
export const createBenefit = async (req, res) => {
  try {
    const { title, description, logoUrl, discountText, linkUrl, active } = req.body;

    if (!title || !description || !logoUrl) {
      return res.status(400).json({ message: 'Por favor completa título, descripción e imagen/logo.' });
    }

    const benefit = new Benefit({
      title,
      description,
      logoUrl,
      discountText: discountText || '',
      linkUrl: linkUrl || '',
      active: active !== undefined ? active : true
    });

    const createdBenefit = await benefit.save();
    res.status(201).json(createdBenefit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar beneficio de local
// @route   PUT /api/benefits/:id
// @access  Admin
export const updateBenefit = async (req, res) => {
  try {
    const { title, description, logoUrl, discountText, linkUrl, active } = req.body;

    const benefit = await Benefit.findById(req.params.id);

    if (benefit) {
      benefit.title = title || benefit.title;
      benefit.description = description || benefit.description;
      benefit.logoUrl = logoUrl || benefit.logoUrl;
      if (discountText !== undefined) benefit.discountText = discountText;
      if (linkUrl !== undefined) benefit.linkUrl = linkUrl;
      if (active !== undefined) benefit.active = active;

      const updatedBenefit = await benefit.save();
      res.json(updatedBenefit);
    } else {
      res.status(404).json({ message: 'Beneficio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar beneficio de local
// @route   DELETE /api/benefits/:id
// @access  Admin
export const deleteBenefit = async (req, res) => {
  try {
    const benefit = await Benefit.findById(req.params.id);

    if (benefit) {
      await Benefit.deleteOne({ _id: req.params.id });
      res.json({ message: 'Beneficio eliminado' });
    } else {
      res.status(404).json({ message: 'Beneficio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
