import Folder from '../models/folderModel.js';
import Content from '../models/contentModel.js';

// @desc    Get all folders for a user
// @route   GET /api/folders
// @access  Private
export const getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ user: req.user._id })
      .populate({
        path: 'items',
        populate: {
          path: 'category',
          model: 'Category'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new folder
// @route   POST /api/folders
// @access  Private
export const createFolder = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Por favor, proporciona un nombre para la carpeta');
    }

    const folder = await Folder.create({
      name: name.trim(),
      user: req.user._id,
      items: [],
    });

    res.status(201).json({
      success: true,
      message: 'Carpeta creada con éxito',
      data: folder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
export const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      res.status(404);
      throw new Error('Carpeta no encontrada');
    }

    // Verify ownership
    if (folder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('No autorizado para eliminar esta carpeta');
    }

    await folder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Carpeta eliminada con éxito',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to folder
// @route   POST /api/folders/:id/items
// @access  Private
export const addItemToFolder = async (req, res, next) => {
  try {
    const { contentId } = req.body;

    if (!contentId) {
      res.status(400);
      throw new Error('Por favor, proporciona el ID de contenido');
    }

    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      res.status(404);
      throw new Error('Carpeta no encontrada');
    }

    // Verify ownership
    if (folder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('No autorizado para modificar esta carpeta');
    }

    // Verify content exists
    const content = await Content.findById(contentId);
    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    // Check if item already exists in folder
    if (folder.items.includes(contentId)) {
      res.status(400);
      throw new Error('El contenido ya se encuentra guardado en esta carpeta');
    }

    folder.items.push(contentId);
    await folder.save();

    // Re-fetch populated folder items
    const updatedFolder = await Folder.findById(folder._id).populate({
      path: 'items',
      populate: {
        path: 'category',
        model: 'Category'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Contenido guardado en la carpeta con éxito',
      data: updatedFolder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from folder
// @route   DELETE /api/folders/:id/items/:contentId
// @access  Private
export const removeItemFromFolder = async (req, res, next) => {
  try {
    const { id, contentId } = req.params;

    const folder = await Folder.findById(id);

    if (!folder) {
      res.status(404);
      throw new Error('Carpeta no encontrada');
    }

    // Verify ownership
    if (folder.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('No autorizado para modificar esta carpeta');
    }

    // Check if item exists in folder
    const itemIndex = folder.items.indexOf(contentId);
    if (itemIndex === -1) {
      res.status(404);
      throw new Error('El contenido no se encuentra en esta carpeta');
    }

    folder.items.splice(itemIndex, 1);
    await folder.save();

    // Re-fetch populated folder items
    const updatedFolder = await Folder.findById(folder._id).populate({
      path: 'items',
      populate: {
        path: 'category',
        model: 'Category'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Contenido eliminado de la carpeta con éxito',
      data: updatedFolder,
    });
  } catch (error) {
    next(error);
  }
};
