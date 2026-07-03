import VideotecaFolder from '../models/videotecaFolderModel.js';

// @desc    Get all videoteca folders
// @route   GET /api/videoteca-folders
// @access  Public
export const getVideoFolders = async (req, res, next) => {
  try {
    const folders = await VideotecaFolder.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new videoteca folder
// @route   POST /api/videoteca-folders
// @access  Private/Admin
export const createVideoFolder = async (req, res, next) => {
  try {
    const { name, coverImage } = req.body;
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Por favor, proporcione un nombre para la carpeta.');
    }

    const folder = await VideotecaFolder.create({
      name: name.trim(),
      coverImage: coverImage || '',
    });

    res.status(201).json({
      success: true,
      message: 'Carpeta de videoteca creada con éxito.',
      data: folder,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      error.message = 'Ya existe una carpeta con ese nombre.';
    }
    next(error);
  }
};

// @desc    Update a videoteca folder
// @route   PUT /api/videoteca-folders/:id
// @access  Private/Admin
export const updateVideoFolder = async (req, res, next) => {
  try {
    const { name, coverImage } = req.body;
    const folder = await VideotecaFolder.findById(req.params.id);

    if (!folder) {
      res.status(404);
      throw new Error('Carpeta no encontrada.');
    }

    folder.name = name?.trim() || folder.name;
    if (coverImage !== undefined) {
      folder.coverImage = coverImage;
    }
    const updated = await folder.save();

    res.status(200).json({
      success: true,
      message: 'Carpeta actualizada con éxito.',
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      error.message = 'Ya existe una carpeta con ese nombre.';
    }
    next(error);
  }
};

// @desc    Delete a videoteca folder
// @route   DELETE /api/videoteca-folders/:id
// @access  Private/Admin
export const deleteVideoFolder = async (req, res, next) => {
  try {
    const folder = await VideotecaFolder.findById(req.params.id);

    if (!folder) {
      res.status(404);
      throw new Error('Carpeta no encontrada.');
    }

    await folder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Carpeta eliminada con éxito.',
    });
  } catch (error) {
    next(error);
  }
};
