import Content from '../models/contentModel.js';
import User from '../models/userModel.js';
import { calculatePrice } from '../utils/pricingHelper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all content
// @route   GET /api/content
// @access  Public
export const getContents = async (req, res, next) => {
  try {
    const filter = {};
    
    // Support filtering by contentType (using type or contentType query params)
    if (req.query.type) {
      filter.contentType = req.query.type;
    } else if (req.query.contentType) {
      filter.contentType = req.query.contentType;
    }

    // Support filtering by accessType
    if (req.query.accessType) {
      filter.accessType = req.query.accessType;
    }

    const contents = await Content.find(filter).populate('category').populate('videoFolder');

    res.status(200).json({
      success: true,
      count: contents.length,
      data: contents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new content
// @route   POST /api/content
// @access  Private/Admin
export const createContent = async (req, res, next) => {
  try {
    const { title, description, contentType, accessType, price, priceUsd, priceArs, cardImage, cardImagePosition, publishDate, category, body, isPublished, status, videoFolder, videoLink, attachments, modules, certificate, duration } = req.body;

    if (!title || !description || !contentType || !accessType) {
      res.status(400);
      throw new Error(
        'Por favor, proporcione todos los campos obligatorios (title, description, contentType, accessType)'
      );
    }

    const content = await Content.create({
      title,
      description,
      contentType,
      accessType,
      priceUsd: priceUsd !== undefined ? priceUsd : (price || 0),
      priceArs: priceArs !== undefined ? priceArs : 0,
      price: priceUsd !== undefined ? priceUsd : (price || 0),
      cardImage: cardImage || '',
      cardImagePosition: cardImagePosition || '50%',
      publishDate: publishDate || undefined,
      category: category || undefined,
      body: body || '',
      isPublished: isPublished !== undefined ? isPublished : (status !== 'draft'),
      status: status || (isPublished === false ? 'draft' : 'published'),
      videoFolder: videoFolder || undefined,
      videoLink: videoLink || '',
      attachments: attachments || [],
      modules: modules || [],
      certificate: certificate !== undefined ? certificate : true,
      duration: duration || '',
    });

    res.status(201).json({
      success: true,
      message: 'Contenido creado con éxito',
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get content by ID
// @route   GET /api/content/:id
// @access  Private (Secured with protect & checkAccess)
export const getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id).populate('category').populate('videoFolder');

    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate checkout / purchase of content
// @route   POST /api/content/:id/checkout
// @access  Private (Secured with protect)
export const checkoutContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    // Verify it is a one-time purchase content
    if (content.accessType !== 'one-time-purchase') {
      res.status(400);
      throw new Error('Este contenido no requiere una compra de pago único.');
    }

    // Load full user document from DB to check and edit purchasedItems
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    // Check if already purchased
    if (user.purchasedItems.includes(content._id)) {
      res.status(400);
      throw new Error('Ya has comprado este contenido.');
    }

    // Calculate final price with dynamic discount helper
    const basePrice = content.price || 0;
    const finalPrice = calculatePrice(user, content);
    const discountApplied = basePrice - finalPrice;

    // Simulate payment transaction
    console.log(
      `[Simulación de Pago] Procesando pago para usuario: ${user.email}. Monto base: $${basePrice}, Descuento: $${discountApplied}, Total Pagado: $${finalPrice}`
    );

    // Save purchase
    user.purchasedItems.push(content._id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Compra simulada y procesada con éxito.',
      transaction: {
        contentId: content._id,
        title: content.title,
        basePrice,
        discountApplied,
        finalPricePaid: finalPrice,
        status: 'completed',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private/Admin
export const updateContent = async (req, res, next) => {
  try {
    const { title, description, contentType, accessType, price, priceUsd, priceArs, cardImage, cardImagePosition, publishDate, category, body, isPublished, status, videoFolder, videoLink, attachments, modules, certificate, duration } = req.body;

    let content = await Content.findById(req.params.id);

    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    content.title = title !== undefined ? title : content.title;
    content.description = description !== undefined ? description : content.description;
    content.contentType = contentType !== undefined ? contentType : content.contentType;
    content.accessType = accessType !== undefined ? accessType : content.accessType;
    content.priceUsd = priceUsd !== undefined ? priceUsd : content.priceUsd;
    content.priceArs = priceArs !== undefined ? priceArs : content.priceArs;
    content.price = priceUsd !== undefined ? priceUsd : (price !== undefined ? price : content.price);
    content.cardImage = cardImage !== undefined ? cardImage : content.cardImage;
    content.cardImagePosition = cardImagePosition !== undefined ? cardImagePosition : content.cardImagePosition;
    content.publishDate = publishDate !== undefined ? publishDate : content.publishDate;
    content.category = category !== undefined ? (category === '' ? undefined : category) : content.category;
    content.body = body !== undefined ? body : content.body;
    content.isPublished = isPublished !== undefined ? isPublished : (status !== undefined ? status !== 'draft' : content.isPublished);
    content.status = status !== undefined ? status : (isPublished !== undefined ? (isPublished ? 'published' : 'draft') : content.status);
    content.videoFolder = videoFolder !== undefined ? (videoFolder === '' ? undefined : videoFolder) : content.videoFolder;
    content.videoLink = videoLink !== undefined ? videoLink : content.videoLink;
    if (attachments !== undefined) {
      content.attachments = attachments;
    }
    if (modules !== undefined) {
      content.modules = modules;
    }
    if (certificate !== undefined) {
      content.certificate = certificate;
    }
    if (duration !== undefined) {
      content.duration = duration;
    }

    const updatedContent = await content.save();

    res.status(200).json({
      success: true,
      message: 'Contenido actualizado con éxito',
      data: updatedContent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private/Admin
export const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    await content.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contenido eliminado con éxito',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/content/:id/reviews
// @access  Private
export const createContentReview = async (req, res, next) => {
  try {
    const { rating, comment, profession } = req.body;

    const content = await Content.findById(req.params.id);

    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    // Update user profession if provided
    let userProfession = profession || req.user.profession || '';
    if (profession !== undefined && profession !== req.user.profession) {
      await User.findByIdAndUpdate(req.user._id, { profession });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      profession: userProfession,
      user: req.user._id,
    };

    content.reviews.push(review);
    content.numReviews = content.reviews.length;
    content.rating =
      content.reviews.reduce((acc, item) => item.rating + acc, 0) /
      content.reviews.length;

    await content.save();
    res.status(201).json({ success: true, message: 'Reseña agregada con éxito', data: content });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload file/video/PDF for content (blogs/courses)
// @route   POST /api/content/upload-file
// @access  Private/Admin
export const uploadContentFile = async (req, res, next) => {
  try {
    const { file, filename, fileType } = req.body;

    if (!file) {
      res.status(400);
      throw new Error('Por favor, proporcione el archivo en formato base64');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const ext = filename ? (filename.split('.').pop() || 'file').toLowerCase().replace(/[^a-z0-9]/g, '') : 'file';
    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9.\-_]/g, '_') : `archivo_${Date.now()}.${ext}`;
    const uniqueFilename = `blog_${Date.now()}_${cleanName}`;

    // 1. Try Cloudinary if Production SDK is configured
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      try {
        const resourceType = ext === 'mp4' || ext === 'webm' || ext === 'mov' || ext === 'avi' ? 'video' : 'raw';
        const uploadRes = await cloudinary.uploader.upload(file, {
          resource_type: resourceType,
          type: 'upload',
          access_mode: 'public',
          chunk_size: 6000000,
          folder: 'blog_attachments',
          filename_override: uniqueFilename,
          use_filename: true,
          unique_filename: true,
        });

        if (uploadRes && uploadRes.secure_url) {
          return res.status(200).json({
            success: true,
            url: uploadRes.secure_url,
            filename: cleanName,
            fileType: ext,
          });
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload falló, guardando en servidor local:', cloudErr.message);
      }
    }

    // 2. Local Disk Storage (Always works as robust fallback or local dev)
    const base64Data = file.replace(/^data:.*?;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    const backendUploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(backendUploadsDir)) {
      fs.mkdirSync(backendUploadsDir, { recursive: true });
    }
    const backendFilePath = path.join(backendUploadsDir, uniqueFilename);
    await fs.promises.writeFile(backendFilePath, fileBuffer);

    try {
      const frontendUploadsDir = path.join(__dirname, '../../frontend/public/uploads');
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(frontendUploadsDir, uniqueFilename), fileBuffer);
    } catch (feErr) {
      // Ignore if frontend directory not reachable in production
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${uniqueFilename}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
      filename: cleanName,
      fileType: ext,
    });
  } catch (error) {
    next(error);
  }
};

