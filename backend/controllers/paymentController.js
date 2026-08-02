import { MercadoPagoConfig, Preference, PreApproval, Payment } from 'mercadopago';
import User from '../models/userModel.js';
import Content from '../models/contentModel.js';
import Coupon from '../models/couponModel.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';
import { calculatePrice } from '../utils/pricingHelper.js';

// Get Mercado Pago config using ACCESS_TOKEN from env dynamically
const getMPClient = () => {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN no está configurado en las variables de entorno.');
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN.trim(),
  });
};


export const testMpToken = async (req, res) => {
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
    const maskedToken = token.substring(0, 20) + '...';

    const { default: axios } = await import('axios');
    const response = await axios.post(
      'https://api.mercadopago.com/preapproval',
      {
        back_url: `https://yourdomain.com/payments/status`,
        reason: 'Test Token Mensual',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 1990,
          currency_id: 'ARS',
        },
        payer_email: 'test_user_super_random_123@gmail.com',
        status: 'pending',
        external_reference: '123456789',
      },
      {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Token de MP funciona perfecto!',
      maskedToken,
      mpResponse: response.data.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      maskedToken: (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').substring(0, 20) + '...',
      error: error.response?.data || error.message
    });
  }
};

// @desc    Create Mercado Pago Subscription Link (PreApproval)
// @route   POST /api/payments/mercadopago/subscribe
// @access  Private
export const subscribeMercadoPago = async (req, res, next) => {
  try {
    const planConfig = (await SubscriptionPlan.findOne({})) || {};
    const amount = Number(planConfig.mpAmount) || 1990;

    const client = getMPClient();
    const preApproval = new PreApproval(client);

    if (process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-')) {
      throw new Error('Mercado Pago no permite crear suscripciones (PreApproval) con credenciales de prueba (TEST-). Por favor, utiliza un Access Token de Producción (APP_USR-).');
    }

    // Usar axios directamente en lugar del SDK para capturar mejor el error
    const { default: axios } = await import('axios');
    const response = await axios.post(
      'https://api.mercadopago.com/preapproval',
      {
        back_url: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/payments/status`,
        reason: 'Suscripcion Mensual',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: parseFloat(amount),
          currency_id: 'ARS',
        },
        payer_email: 'test_user_super_random_123@gmail.com', // HARDCODED FOR DEBUGGING
        status: 'pending',
        external_reference: req.user._id.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN.trim()}`,
          'Content-Type': 'application/json',
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Suscripción de Mercado Pago creada con éxito',
      subscriptionId: response.data.id,
      initPoint: response.data.init_point,
    });
  } catch (error) {
    const errorData = error.response?.data || {};
    const errMsg = errorData.message || error.message;
    console.error("====== MP AXIOS SUBSCRIPTION ERROR ======");
    console.error(JSON.stringify(errorData, null, 2));
    console.error(error.stack);
    console.error("=========================================");
    res.status(error.response?.status || 500).json({
      success: false,
      message: `Error crudo MP: ${errMsg}`,
      mpData: errorData,
      rawMessage: error.message
    });
  }
};

// @desc    Create Mercado Pago Checkout Preference (One-time Purchase)
// @route   POST /api/payments/mercadopago/checkout
// @access  Private
export const checkoutMercadoPago = async (req, res, next) => {
  try {
    const { contentId, couponCode } = req.body;

    if (!contentId) {
      res.status(400);
      throw new Error('Por favor, proporcione el contentId del contenido a comprar');
    }

    const content = await Content.findById(contentId);
    if (!content) {
      res.status(404);
      throw new Error('Contenido no encontrado');
    }

    if (content.accessType !== 'one-time-purchase') {
      res.status(400);
      throw new Error('Este contenido no requiere un pago único');
    }

    let couponDiscount = 0;
    if (couponCode) {
      const uppercaseCode = couponCode.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: uppercaseCode, active: true });
      if (coupon) {
        if (coupon.applyToAll || (coupon.applicableCourses && coupon.applicableCourses.some(id => id.toString() === contentId.toString()))) {
          couponDiscount = coupon.discountPercentage || 0;
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          await coupon.save();
        }
      }
    }

    // Calculate final price with helper (applies member discount and/or coupon discount)
    const finalPrice = Number(calculatePrice(req.user, content, 'ARS', couponDiscount));

    const client = getMPClient();
    const preference = new Preference(client);

    // Generate Mercado Pago checkout preference
    const result = await preference.create({
      body: {
        items: [
          {
            id: content._id.toString(),
            title: content.title,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/payments/success`,
          failure: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/payments/failure`,
          pending: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/payments/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL || 'https://tu-backend-url.onrender.com'}/api/payments/mercadopago/webhook`, // Public webhook endpoint
        external_reference: JSON.stringify({
          userId: req.user._id.toString(),
          contentId: content._id.toString(),
          paymentType: 'one-time-purchase',
        }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Preferencia de checkout de Mercado Pago generada con éxito',
      preferenceId: result.id,
      finalPrice: finalPrice,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error) {
    const errorDetails = error.cause || error.response?.data || error.message;
    console.error('Error en checkoutMercadoPago:', errorDetails);
    res.status(500);
    next(new Error(`Error en Mercado Pago: ${JSON.stringify(errorDetails)}`));
  }
};

// @desc    Mercado Pago Async Webhook Notification Handler
// @route   POST /api/payments/mercadopago/webhook
// @access  Public
export const webhookMercadoPago = async (req, res, next) => {
  try {
    const { type, data } = req.body;

    // Log the notification for visibility
    console.log(`[Mercado Pago Webhook] Recibida notificación. Tipo: ${type}, ID: ${data?.id}`);

    if (!type || !data || !data.id) {
      return res.status(200).json({
        success: true,
        message: 'Notificación recibida sin datos procesables (ignorado)',
      });
    }

    const resourceId = data.id;

    if (type === 'payment') {
      // One-time payment notification
      const client = getMPClient();
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: resourceId });

      if (paymentData.status === 'approved') {
        const metadata = JSON.parse(paymentData.external_reference);

        if (metadata && metadata.paymentType === 'one-time-purchase') {
          const user = await User.findById(metadata.userId);
          if (user) {
            if (!user.purchasedItems.includes(metadata.contentId)) {
              user.purchasedItems.push(metadata.contentId);
              await user.save();
              console.log(
                `[Webhook] Compra registrada con éxito para usuario: ${user.email} | Contenido: ${metadata.contentId}`
              );
            }
          }
        }
      }
    } else if (type === 'subscription' || type === 'preapproval') {
      // Recurring subscription notification
      const client = getMPClient();
      const preApproval = new PreApproval(client);
      const preApprovalData = await preApproval.get({ id: resourceId });

      if (preApprovalData.status === 'authorized' || preApprovalData.status === 'active') {
        let userId = null;
        if (preApprovalData.external_reference) {
          try {
            const metadata = JSON.parse(preApprovalData.external_reference);
            userId = metadata?.userId;
          } catch (e) {
            userId = preApprovalData.external_reference; // It was a plain string ID
          }
        }
        if (!userId) {
          userId = (await User.findOne({ subscriptionId: resourceId }))?._id;
        }

        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.isSubscribed = true;
            user.subscriptionId = resourceId;
            user.membership = 'premium';
            // Si renueva o activa, quitamos cualquier fecha límite previa de expiración
            user.membershipExpiresAt = null;
            await user.save();
            console.log(
              `[Webhook MP] Suscripción Premium activada con éxito para usuario: ${user.email} | ID de Suscripción: ${resourceId}`
            );
          }
        }
      } else if (
        preApprovalData.status === 'cancelled' ||
        preApprovalData.status === 'paused' ||
        preApprovalData.status === 'expired'
      ) {
        let userId = null;
        if (preApprovalData.external_reference) {
          try {
            const metadata = JSON.parse(preApprovalData.external_reference);
            userId = metadata?.userId;
          } catch (e) {
            userId = preApprovalData.external_reference; // It was a plain string ID
          }
        }
        if (!userId) {
          userId = (await User.findOne({ subscriptionId: resourceId }))?._id;
        }

        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.isSubscribed = false;
            // Si Mercado Pago informa la próxima fecha de cobro (next_payment_date) y está en el futuro,
            // mantenemos la membresía premium activa hasta esa fecha exacta para no cortarle los días ya pagados.
            const nextPayment = preApprovalData.next_payment_date
              ? new Date(preApprovalData.next_payment_date)
              : null;
            if (nextPayment && nextPayment > new Date()) {
              user.membershipExpiresAt = nextPayment;
              console.log(
                `[Webhook MP] Suscripción cancelada/pausada para usuario: ${user.email}. Acceso mantenido hasta fin de periodo: ${nextPayment.toLocaleDateString('es-ES')}`
              );
            } else if (!user.membershipExpiresAt || new Date(user.membershipExpiresAt) <= new Date()) {
              // Si no hay fecha futura o el periodo ya expiró, revocamos el acceso en el acto
              user.membership = 'free';
              user.subscriptionId = null;
              console.log(
                `[Webhook MP] Suscripción expirada/cancelada para usuario: ${user.email}. Acceso revocado en el sistema.`
              );
            } else {
              console.log(
                `[Webhook MP] Suscripción cancelada para usuario: ${user.email}. Acceso mantenido hasta fecha límite previa: ${new Date(user.membershipExpiresAt).toLocaleDateString('es-ES')}`
              );
            }
            await user.save();
          }
        }
      }
    }

    // Always respond with 200 to acknowledge notification receipt
    return res.status(200).json({
      success: true,
      message: 'Notificación de Mercado Pago recibida y procesada con éxito',
    });
  } catch (error) {
    console.error(`[Error de Webhook] ${error.message}`);
    // Respond with 200 anyway to prevent Mercado Pago from retrying endlessly on bad metadata/payload errors
    return res.status(200).json({
      success: false,
      message: `Error interno de procesamiento: ${error.message}`,
    });
  }
};
