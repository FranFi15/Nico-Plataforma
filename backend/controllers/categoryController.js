import Category from '../models/categoryModel.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type && type !== 'all') {
      if (type === 'course') {
        filter.$or = [{ type: 'course' }, { type: 'general' }, { type: { $exists: false } }, { type: null }];
      } else {
        filter.type = type;
      }
    }
    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, type = 'course' } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Por favor, proporcione un nombre para la categoría');
    }

    const targetType = type || 'course';

    // Check if category name already exists in this type
    const categoryExists = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type: targetType
    });
    if (categoryExists) {
      res.status(400);
      throw new Error('Esta categoría ya existe para este tipo');
    }

    const category = await Category.create({ name: name.trim(), type: targetType });

    res.status(201).json({
      success: true,
      message: 'Categoría creada con éxito',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Por favor, proporcione un nombre para la categoría');
    }

    let category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Categoría no encontrada');
    }

    const targetType = type || category.type || 'course';

    // Check if other category in this type has the same name
    const categoryExists = await Category.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type: targetType,
    });
    if (categoryExists) {
      res.status(400);
      throw new Error('Ya existe otra categoría con este nombre en este tipo');
    }

    category.name = name.trim();
    if (type) category.type = type;
    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada con éxito',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Categoría no encontrada');
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada con éxito',
    });
  } catch (error) {
    next(error);
  }
};
