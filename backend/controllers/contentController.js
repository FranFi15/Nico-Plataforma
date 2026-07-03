import Content from '../models/contentModel.js';
import User from '../models/userModel.js';
import { calculatePrice } from '../utils/pricingHelper.js';

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
    const { title, description, contentType, accessType, price, priceUsd, priceArs, cardImage, cardImagePosition, publishDate, category, body, videoFolder, videoLink } = req.body;

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
      videoFolder: videoFolder || undefined,
      videoLink: videoLink || '',
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
    const { title, description, contentType, accessType, price, priceUsd, priceArs, cardImage, cardImagePosition, publishDate, category, body, videoFolder, videoLink } = req.body;

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
    content.videoFolder = videoFolder !== undefined ? (videoFolder === '' ? undefined : videoFolder) : content.videoFolder;
    content.videoLink = videoLink !== undefined ? videoLink : content.videoLink;

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

