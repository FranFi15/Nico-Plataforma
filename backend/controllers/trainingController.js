import Training from '../models/trainingModel.js';
import axios from 'axios';

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Public
export const getTrainings = async (req, res, next) => {
  try {
    const trainings = await Training.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new training program
// @route   POST /api/trainings
// @access  Private/Admin
export const createTraining = async (req, res, next) => {
  try {
    const { title, description, subDescription, youtubeShortLink, googleFormLink, athletePhotos } = req.body;

    if (!title || !description || !googleFormLink) {
      res.status(400);
      throw new Error(
        'Por favor, proporcione todos los campos obligatorios (title, description, googleFormLink)'
      );
    }

    const training = await Training.create({
      title,
      description,
      subDescription,
      youtubeShortLink,
      googleFormLink,
      athletePhotos: athletePhotos || [],
    });

    res.status(201).json({
      success: true,
      message: 'Programa de entrenamiento creado con éxito',
      data: training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private/Admin
export const deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      res.status(404);
      throw new Error('Programa de entrenamiento no encontrado');
    }

    await training.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Programa de entrenamiento eliminado con éxito',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update training program
// @route   PUT /api/trainings/:id
// @access  Private/Admin
export const updateTraining = async (req, res, next) => {
  try {
    const { title, description, subDescription, youtubeShortLink, googleFormLink, athletePhotos } = req.body;

    let training = await Training.findById(req.params.id);

    if (!training) {
      res.status(404);
      throw new Error('Programa de entrenamiento no encontrado');
    }

    training.title = title !== undefined ? title : training.title;
    training.description = description !== undefined ? description : training.description;
    training.subDescription = subDescription !== undefined ? subDescription : training.subDescription;
    training.youtubeShortLink = youtubeShortLink !== undefined ? youtubeShortLink : training.youtubeShortLink;
    training.googleFormLink = googleFormLink !== undefined ? googleFormLink : training.googleFormLink;
    training.athletePhotos = athletePhotos !== undefined ? athletePhotos : training.athletePhotos;

    const updatedTraining = await training.save();

    res.status(200).json({
      success: true,
      message: 'Programa de entrenamiento actualizado con éxito',
      data: updatedTraining,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo to Cloudinary
// @route   POST /api/trainings/upload
// @access  Private/Admin
export const uploadPhoto = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400);
      throw new Error('Por favor, proporcione la imagen en formato base64');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      res.status(500);
      throw new Error('Cloudinary no está configurado en las variables de entorno del servidor');
    }

    const cloudinaryRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        file: image,
        upload_preset: uploadPreset,
        filename_override: `upload_${Date.now()}`
      }
    );

    if (cloudinaryRes.data && cloudinaryRes.data.secure_url) {
      res.status(200).json({
        success: true,
        url: cloudinaryRes.data.secure_url,
      });
    } else {
      res.status(500);
      throw new Error('Error al obtener la URL segura de Cloudinary');
    }
  } catch (error) {
    const errDetails = error.response?.data || error.message;
    console.error('Cloudinary Upload Error Details:', errDetails);
    
    // Log to file for remote debugging
    try {
      const fs = await import('fs');
      fs.writeFileSync('cloudinary_error.log', JSON.stringify({
        timestamp: new Date().toISOString(),
        error: errDetails,
        stack: error.stack
      }, null, 2));
    } catch (fsErr) {
      console.error('Error writing to log file:', fsErr);
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message,
      details: errDetails
    });
  }
};

// @desc    Reorder training programs
// @route   PUT /api/trainings/reorder
// @access  Private/Admin
export const reorderTrainings = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      res.status(400);
      throw new Error('Debe proporcionar un arreglo de IDs ordenados');
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await Training.findByIdAndUpdate(orderedIds[i], { order: i });
    }

    res.status(200).json({
      success: true,
      message: 'Orden actualizado con éxito',
    });
  } catch (error) {
    next(error);
  }
};

