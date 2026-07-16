import Evaluation from '../models/evaluationModel.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get evaluation configuration
// @route   GET /api/evaluations
// @access  Public
export const getEvaluationConfig = async (req, res, next) => {
  try {
    let config = await Evaluation.findOne();

    if (!config) {
      config = await Evaluation.create({});
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update evaluation configuration
// @route   PUT /api/evaluations
// @access  Private/Admin
export const updateEvaluationConfig = async (req, res, next) => {
  try {
    const { colectivoPdfUrl, colectivoFormLink, individualPdfUrl, individualFormLink, colectivoVideos, individualVideos } = req.body;

    let config = await Evaluation.findOne();

    if (!config) {
      config = new Evaluation();
    }

    if (colectivoPdfUrl !== undefined) config.colectivoPdfUrl = colectivoPdfUrl;
    if (colectivoFormLink !== undefined) config.colectivoFormLink = colectivoFormLink;
    if (individualPdfUrl !== undefined) config.individualPdfUrl = individualPdfUrl;
    if (individualFormLink !== undefined) config.individualFormLink = individualFormLink;
    if (colectivoVideos !== undefined) config.colectivoVideos = colectivoVideos;
    if (individualVideos !== undefined) config.individualVideos = individualVideos;

    const updatedConfig = await config.save();

    res.status(200).json({
      success: true,
      message: 'Configuración de Evaluaciones actualizada con éxito',
      data: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload PDF to Cloudinary (Signed SDK for Production / Render) or Local Disk
// @route   POST /api/evaluations/upload-pdf
// @access  Private/Admin
export const uploadPdfFile = async (req, res, next) => {
  try {
    const { file } = req.body;

    if (!file) {
      res.status(400);
      throw new Error('Por favor, proporcione el archivo en formato base64');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // 1. Production Mode / Cloudinary Signed SDK Upload (when API_KEY and API_SECRET are configured)
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      try {
        const uploadRes = await cloudinary.uploader.upload(file, {
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          chunk_size: 6000000, // 6 MB chunk size to reliably handle large PDFs > 10MB up to 100MB
          folder: 'evaluations',
          filename_override: `evaluacion_${Date.now()}.pdf`,
          use_filename: true,
          unique_filename: true,
        });

        if (uploadRes && uploadRes.secure_url) {
          return res.status(200).json({
            success: true,
            url: uploadRes.secure_url,
            message: 'Archivo subido correctamente a Cloudinary (Signed SDK Producción)',
          });
        }
      } catch (cloudErr) {
        console.error('Error in Cloudinary Signed SDK Upload:', cloudErr);
        // Fallback to local disk if Cloudinary SDK fails, but log error
        console.warn('Cloudinary SDK falló, intentando guardar en servidor local...');
      }
    }

    // 2. Unsigned Preset Attempt (if only upload_preset is configured and file <= 9.5MB)
    const base64Data = file.replace(/^data:.*?;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileSizeBytes = fileBuffer.length;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset && !apiKey && fileSizeBytes <= 9.5 * 1024 * 1024) {
      try {
        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
          {
            file: file,
            upload_preset: uploadPreset,
            filename_override: `evaluacion_${Date.now()}.pdf`
          }
        );

        if (cloudinaryRes.data && cloudinaryRes.data.secure_url) {
          return res.status(200).json({
            success: true,
            url: cloudinaryRes.data.secure_url,
            message: 'Archivo subido correctamente a Cloudinary (Unsigned Preset)'
          });
        }
      } catch (unsErr) {
        console.warn('Cloudinary unsigned upload falló o excedió límites, guardando en servidor local:', unsErr.message);
      }
    }

    // 3. Fallback / Local Server Storage (Always works for local development or VPS)
    const filename = `evaluacion_${Date.now()}.pdf`;
    const backendUploadsDir = path.join(__dirname, '../public/uploads');

    if (!fs.existsSync(backendUploadsDir)) {
      fs.mkdirSync(backendUploadsDir, { recursive: true });
    }

    const backendFilePath = path.join(backendUploadsDir, filename);
    await fs.promises.writeFile(backendFilePath, fileBuffer);

    try {
      const frontendUploadsDir = path.join(__dirname, '../../frontend/public/uploads');
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(frontendUploadsDir, filename), fileBuffer);
    } catch (feErr) {
      // Ignore if frontend directory is not writable/present in production
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
      message: 'Archivo guardado correctamente en el servidor'
    });
  } catch (error) {
    const errDetails = error.response?.data || error.message;
    console.error('PDF Upload Error:', errDetails);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message,
      details: errDetails
    });
  }
};

// @desc    Download / proxy PDF to force browser download and bypass CORS
// @route   GET /api/evaluations/download
// @access  Public
export const downloadEvaluationPdf = async (req, res, next) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL requerida para descarga' });
    }

    const downloadFilename = filename || 'Evaluaciones_Kinvent.pdf';

    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Case 1: Local file URL (/uploads/filename.pdf or http://localhost:5001/uploads/filename.pdf)
    if (url.includes('/uploads/')) {
      const localFilename = url.split('/uploads/').pop();
      const localFilePath = path.join(__dirname, '../public/uploads', localFilename);
      if (fs.existsSync(localFilePath)) {
        return res.sendFile(localFilePath);
      }
    }

    // Case 2: Cloudinary or remote URL
    const cleanUrl = url.replace('/raw/upload/fl_attachment/', '/raw/upload/');
    
    try {
      const remoteRes = await axios.get(cleanUrl, { responseType: 'stream' });
      return remoteRes.data.pipe(res);
    } catch (axiosErr) {
      // If Cloudinary returns 401 (deny/ACL failure), try downloading using Cloudinary Private/Signed URL if SDK is configured
      if (axiosErr.response?.status === 401 && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        
        // Extract public_id from Cloudinary URL (e.g. evaluations/evaluacion_12345.pdf)
        const parts = cleanUrl.split('/upload/');
        if (parts.length === 2) {
          let publicId = parts[1].replace(/^v\d+\//, ''); // Remove version v123456/
          const signedDownloadUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
            resource_type: 'raw',
            attachment: true
          });
          
          const signedRes = await axios.get(signedDownloadUrl, { responseType: 'stream' });
          return signedRes.data.pipe(res);
        }
      }
      throw axiosErr;
    }
  } catch (error) {
    console.error('Error in downloadEvaluationPdf:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error al descargar el archivo' });
    }
  }
};
