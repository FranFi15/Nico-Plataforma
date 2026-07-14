import axios from 'axios';
import User from '../models/userModel.js';
import Content from '../models/contentModel.js';
import { calculatePrice } from '../utils/pricingHelper.js';
import Coupon from '../models/couponModel.js';

// Retrieve access token from PayPal using basic auth credentials
const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('Las credenciales de PayPal no están configuradas correctamente');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    `${baseUrl}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
};

// @desc    Create PayPal Subscription Link (Pre-configured Plan)
// @route   POST /api/payments/paypal/subscribe
// @access  Private
export const subscribePayPal = async (req, res, next) => {
  try {
    const planId = process.env.PAYPAL_PLAN_ID;
    if (!planId) {
      res.status(500);
      throw new Error('El PAYPAL_PLAN_ID no está configurado en el servidor');
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // Create Subscription payload
    const payload = {
      plan_id: planId,
      subscriber: {
        email_address: req.user.email,
        name: {
          given_name: req.user.name.split(' ')[0] || 'Usuario',
          surname: req.user.name.split(' ')[1] || 'Plataforma',
        },
      },
      application_context: {
        brand_name: 'Plataforma Nico',
        locale: 'es-ES',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: 'https://yourdomain.com/payments/success',
        cancel_url: 'https://yourdomain.com/payments/cancel',
      },
      custom_id: JSON.stringify({
        userId: req.user._id.toString(),
        paymentType: 'subscription',
      }),
    };

    const response = await axios.post(
      `${baseUrl}/v1/billing/subscriptions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const approvalLink = response.data.links.find((link) => link.rel === 'approve');

    res.status(200).json({
      success: true,
      message: 'Orden de suscripción de PayPal creada con éxito',
      subscriptionId: response.data.id,
      approvalUrl: approvalLink ? approvalLink.href : null,
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    res.status(error.response?.status || 500);
    next(new Error(`Error al crear suscripción de PayPal: ${errMsg}`));
  }
};

// @desc    Create PayPal Order Checkout (One-time Purchase)
// @route   POST /api/payments/paypal/checkout
// @access  Private
export const checkoutPayPal = async (req, res, next) => {
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

    // Calculate final price with dynamic discounts helper
    const finalPrice = calculatePrice(req.user, content, 'USD', couponDiscount);

    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // Create PayPal v2 Order
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD', // PayPal defaults to USD
            value: finalPrice.toFixed(2),
          },
          description: `Compra de: ${content.title}`,
          custom_id: JSON.stringify({
            userId: req.user._id.toString(),
            contentId: content._id.toString(),
            paymentType: 'one-time-purchase',
          }),
        },
      ],
      application_context: {
        brand_name: 'Plataforma Nico',
        locale: 'es-ES',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: 'https://yourdomain.com/payments/success',
        cancel_url: 'https://yourdomain.com/payments/cancel',
      },
    };

    const response = await axios.post(
      `${baseUrl}/v2/checkout/orders`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const approvalLink = response.data.links.find((link) => link.rel === 'approve');

    res.status(200).json({
      success: true,
      message: 'Orden de checkout de PayPal creada con éxito',
      orderId: response.data.id,
      finalPrice: finalPrice,
      approvalUrl: approvalLink ? approvalLink.href : null,
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    res.status(error.response?.status || 500);
    next(new Error(`Error al crear orden de PayPal: ${errMsg}`));
  }
};

// @desc    PayPal Asynchronous Webhook Notification Handler
// @route   POST /api/payments/paypal/webhook
// @access  Public
export const webhookPayPal = async (req, res) => {
  try {
    const { event_type, resource } = req.body;

    console.log(`[PayPal Webhook] Recibido evento: ${event_type}`);

    if (!event_type || !resource) {
      return res.status(200).json({
        success: true,
        message: 'Evento de webhook vacío o no procesable (ignorado)',
      });
    }

    if (event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = resource.id;
      const customIdStr = resource.custom_id;

      if (customIdStr) {
        const metadata = JSON.parse(customIdStr);

        if (metadata && metadata.paymentType === 'subscription') {
          const user = await User.findById(metadata.userId);
          if (user) {
            user.isSubscribed = true;
            user.subscriptionId = subscriptionId;
            user.membership = 'premium';
            await user.save();
            console.log(
              `[Webhook PayPal] Suscripción Premium activada con éxito para usuario: ${user.email} | ID de Suscripción: ${subscriptionId}`
            );
          }
        }
      }
    } else if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const customIdStr = resource.custom_id;

      if (customIdStr) {
        const metadata = JSON.parse(customIdStr);

        if (metadata && metadata.paymentType === 'one-time-purchase') {
          const user = await User.findById(metadata.userId);
          if (user) {
            if (!user.purchasedItems.includes(metadata.contentId)) {
              user.purchasedItems.push(metadata.contentId);
              await user.save();
              console.log(
                `[Webhook PayPal] Compra registrada con éxito para usuario: ${user.email} | Contenido: ${metadata.contentId}`
              );
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notificación de PayPal recibida y procesada con éxito',
    });
  } catch (error) {
    console.error(`[Error Webhook PayPal] ${error.message}`);
    return res.status(200).json({
      success: false,
      message: `Error interno de procesamiento: ${error.message}`,
    });
  }
};
