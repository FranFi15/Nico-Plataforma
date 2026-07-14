import ZoomEvent from '../models/zoomEventModel.js';
import User from '../models/userModel.js';

// @route   GET /api/zoomevents
// @access  Public / Private
export const getZoomEvents = async (req, res, next) => {
  try {
    const events = await ZoomEvent.find().populate('targetCourseId', 'title _id').sort({ eventDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/zoomevents
// @access  Private / Admin
export const createZoomEvent = async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      zoomUrl,
      eventDate,
      targetAudience,
      targetCourseId,
      sendNotification
    } = req.body;

    const eventType = type === 'news' ? 'news' : 'zoom';

    if (!title) {
      res.status(400);
      throw new Error('Por favor ingresa un título para la publicación');
    }

    if (eventType === 'zoom' && (!zoomUrl || !eventDate)) {
      res.status(400);
      throw new Error('Para programar una Charla Zoom, el enlace y la fecha son obligatorios');
    }

    const zoomEvent = await ZoomEvent.create({
      type: eventType,
      title,
      description: description || '',
      zoomUrl: zoomUrl || '',
      eventDate: eventDate || new Date(),
      targetAudience: targetAudience || 'all',
      targetCourseId: targetCourseId || null,
    });

    let notifiedCount = 0;

    // Send notification if enabled (default true)
    if (sendNotification !== false && sendNotification !== 'false') {
      let targetUsers = [];
      if (zoomEvent.targetAudience === 'all') {
        targetUsers = await User.find({ role: { $in: ['student', 'professor', 'profe', 'instructor'] } });
      } else if (zoomEvent.targetAudience === 'members') {
        targetUsers = await User.find({
          $or: [
            { membership: 'premium' },
            { isSubscribed: true }
          ]
        });
      } else if (zoomEvent.targetAudience === 'courses') {
        targetUsers = await User.find({
          $or: [
            { purchasedItems: { $exists: true, $not: { $size: 0 } } },
            { membership: 'premium' },
            { isSubscribed: true }
          ]
        });
      } else if (zoomEvent.targetAudience === 'specific_course' && zoomEvent.targetCourseId) {
        targetUsers = await User.find({
          purchasedItems: zoomEvent.targetCourseId
        });
      }

      const formattedDate = new Date(zoomEvent.eventDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });

      const isNews = zoomEvent.type === 'news';
      const notificationObj = {
        title: isNews ? `📰 Noticia del Muro: ${title}` : `📹 Charla Zoom: ${title}`,
        message: isNews
          ? `${description ? description.slice(0, 150) : '¡Nueva publicación y novedades en el Muro de Noticias!'}`
          : `Programada para el ${formattedDate} hs. ${description ? description.slice(0, 100) : '¡Entra al calendario para ver detalles y unirte!'}`,
        link: '/charlas-zoom',
        read: false,
        createdAt: new Date()
      };

      for (const u of targetUsers) {
        if (!u.notifications) u.notifications = [];
        u.notifications.unshift(notificationObj);
        await u.save();
        notifiedCount++;
      }

      zoomEvent.notifiedCount = notifiedCount;
      await zoomEvent.save();
    }

    const populatedEvent = await ZoomEvent.findById(zoomEvent._id).populate('targetCourseId', 'title _id');

    res.status(201).json({
      success: true,
      event: populatedEvent,
      notifiedCount,
      message: `${eventType === 'news' ? 'Noticia publicada' : 'Charla Zoom creada'} con éxito. ${notifiedCount > 0 ? `Se notificó a ${notifiedCount} usuario(s).` : ''}`
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/zoomevents/:id
// @access  Private / Admin
export const updateZoomEvent = async (req, res, next) => {
  try {
    const { type, title, description, zoomUrl, eventDate, targetAudience, targetCourseId } = req.body;
    let zoomEvent = await ZoomEvent.findById(req.params.id);

    if (!zoomEvent) {
      res.status(404);
      throw new Error('Publicación o Charla Zoom no encontrada');
    }

    zoomEvent.type = type !== undefined ? type : zoomEvent.type;
    zoomEvent.title = title !== undefined ? title : zoomEvent.title;
    zoomEvent.description = description !== undefined ? description : zoomEvent.description;
    zoomEvent.zoomUrl = zoomUrl !== undefined ? zoomUrl : zoomEvent.zoomUrl;
    zoomEvent.eventDate = eventDate !== undefined ? eventDate : zoomEvent.eventDate;
    zoomEvent.targetAudience = targetAudience !== undefined ? targetAudience : zoomEvent.targetAudience;
    zoomEvent.targetCourseId = targetCourseId !== undefined ? targetCourseId : zoomEvent.targetCourseId;

    await zoomEvent.save();
    const populatedEvent = await ZoomEvent.findById(zoomEvent._id).populate('targetCourseId', 'title _id');

    res.status(200).json({
      success: true,
      event: populatedEvent,
      message: 'Publicación actualizada con éxito'
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/zoomevents/:id
// @access  Private / Admin
export const deleteZoomEvent = async (req, res, next) => {
  try {
    const zoomEvent = await ZoomEvent.findById(req.params.id);
    if (!zoomEvent) {
      res.status(404);
      throw new Error('Charla Zoom no encontrada');
    }
    await ZoomEvent.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Charla Zoom eliminada con éxito' });
  } catch (error) {
    next(error);
  }
};
