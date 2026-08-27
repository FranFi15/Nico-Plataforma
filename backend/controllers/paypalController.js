import axios from 'axios';
import User from '../models/userModel.js';
import Content from '../models/contentModel.js';
import { calculatePrice } from '../utils/pricingHelper.js';
import Coupon from '../models/couponModel.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';
import Transaction from '../models/transactionModel.js';

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

    const planConfig = (await SubscriptionPlan.findOne({})) || {};
    const amount = Number(planConfig.paypalAmount) || 15;

    // Create Subscription payload with dynamic price override
    const payload = {
      plan_id: planId,
      plan: {
        billing_cycles: [
          {
            sequence: 1,
            pricing_scheme: {
              fixed_price: {
                value: amount.toString(),
                currency_code: 'USD',
              },
            },
          },
        ],
      },
      subscriber: {
        email_address: req.user.email,
        name: {
          given_name: req.user.name.split(' ')[0] || 'Usuario',
          surname: req.user.name.split(' ')[1] || 'Plataforma',
        },
      },
      application_context: {
        brand_name: 'NS Entrenamiento',
        locale: 'es-ES',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${process.env.FRONTEND_URL || 'https://nsentrenamiento.com'}/pago-procesando`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://nsentrenamiento.com'}/mi-perfil?payment=cancel`,
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

    // Pre-save the subscription ID on the user so the webhook can find it even if custom_id is dropped
    req.user.subscriptionId = response.data.id;
    await req.user.save();

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

// @desc    Verify PayPal Subscription Status (Fast-track activation)
// @route   POST /api/payments/paypal/verify
// @access  Private
export const verifyPayPal = async (req, res, next) => {
  try {
    const { subscription_id } = req.body;
    if (!subscription_id) {
      return res.status(400).json({ success: false, message: 'Falta subscription_id' });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    const response = await axios.get(
      `${baseUrl}/v1/billing/subscriptions/${subscription_id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const subscriptionData = response.data;
    
    // Check if subscription belongs to user
    if (req.user.subscriptionId !== subscription_id) {
        let userIdFromCustomId = null;
        if (subscriptionData.custom_id) {
           try {
              const parsed = JSON.parse(subscriptionData.custom_id);
              userIdFromCustomId = parsed.userId;
           } catch(e) {}
        }
        if (userIdFromCustomId !== req.user._id.toString()) {
           return res.status(403).json({ success: false, message: 'Suscripción no pertenece a este usuario' });
        }
    }

    if (subscriptionData.status === 'ACTIVE') {
      const user = await User.findById(req.user._id);
      if (user) {
        user.isSubscribed = true;
        user.subscriptionId = subscription_id;
        user.membership = 'premium';
        user.membershipExpiresAt = null;
        await user.save();
        return res.status(200).json({ success: true, message: 'Membresía activada', isActive: true });
      }
    }

    res.status(200).json({ success: true, isActive: false, status: subscriptionData.status });
  } catch (error) {
    console.error('Error verifying PayPal subscription:', error.message);
    res.status(500).json({ success: false, message: 'Error verificando suscripción de PayPal' });
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
        brand_name: 'NS Entrenamiento',
        locale: 'es-ES',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL || 'https://nsentrenamiento.com'}/pago-procesando`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://nsentrenamiento.com'}/mi-perfil?payment=cancel`,
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

    if (
      event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
      event_type === 'BILLING.SUBSCRIPTION.UPDATED' ||
      event_type === 'BILLING.SUBSCRIPTION.RE-ACTIVATED'
    ) {
      const subscriptionId = resource.id;
      const customIdStr = resource.custom_id;
      
      let userId = null;
      if (customIdStr) {
        try {
          const parsed = JSON.parse(customIdStr);
          userId = parsed.userId;
        } catch (e) {
          userId = customIdStr;
        }
      }
      
      if (!userId) {
        userId = (await User.findOne({ subscriptionId }))?._id;
      }

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          let isActive = false;
          // Securizar webhook: ir a buscar la verdad a PayPal
          try {
            const accessToken = await getPayPalAccessToken();
            const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
            const subRes = await axios.get(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (subRes.data && (subRes.data.status === 'ACTIVE' || subRes.data.status === 'APPROVED')) {
              isActive = true;
            } else {
              console.log(`[Webhook PayPal] Intento de activación ignorado: Estado real en PayPal no es activo.`);
            }
          } catch (err) {
            console.error(`[Webhook PayPal] Error verificando suscripción ${subscriptionId} en API:`, err.message);
            // Fallback: trust the webhook payload if the API verification fails
            if (resource.status === 'ACTIVE' || resource.status === 'APPROVED' || event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
              console.log(`[Webhook PayPal] Usando fallback payload para activar suscripción.`);
              isActive = true;
            }
          }

          if (isActive) {
            user.isSubscribed = true;
            user.subscriptionId = subscriptionId;
            user.membership = 'premium';
            user.membershipExpiresAt = null;
            await user.save();
            
            // Record Transaction for Subscription
            try {
              const amount = resource.billing_info?.last_payment?.amount?.value || 0;
              const currency = resource.billing_info?.last_payment?.amount?.currency_code || 'USD';
              await Transaction.create({
                user: user._id,
                amount: Number(amount),
                currency,
                platform: 'paypal',
                type: 'subscription',
                externalId: subscriptionId
              });
            } catch (txErr) {
              console.error('[Webhook PayPal] Error al registrar Transaction para sub:', txErr.message);
            }

            console.log(`[Webhook PayPal] Suscripción Premium activa para usuario: ${user.email} | ID: ${subscriptionId}`);

            // Notify admin
            const adminSubject = `Suscripción Premium Activada: ${user.name}`;
            const adminHtml = `
              <div style="font-family: sans-serif; color: #334155; padding: 20px;">
                <h2 style="color: #10b981;">Nueva Membresía (PayPal)</h2>
                <p>El siguiente usuario ha pagado/activado su membresía premium.</p>
                <ul>
                  <li><strong>Nombre:</strong> ${user.name}</li>
                  <li><strong>Email:</strong> ${user.email}</li>
                  <li><strong>ID Suscripción:</strong> ${subscriptionId}</li>
                </ul>
              </div>
            `;
            import('../utils/emailService.js').then(({ sendAdminNotification }) => {
              sendAdminNotification(adminSubject, adminHtml).catch(console.error);
            });
          }
        }
      }
    } else if (
      event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ||
      event_type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
      event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
    ) {
      const subscriptionId = resource.id;
      const customIdStr = resource.custom_id;
      
      let userId = null;
      if (customIdStr) {
        try {
          const parsed = JSON.parse(customIdStr);
          userId = parsed.userId;
        } catch (e) {
          userId = customIdStr;
        }
      }
      
      if (!userId) {
        userId = (await User.findOne({ subscriptionId }))?._id;
      }

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.isSubscribed = false;
          const nextBilling = resource.billing_info?.next_billing_time
            ? new Date(resource.billing_info.next_billing_time)
            : null;

          if (nextBilling && nextBilling > new Date()) {
            user.membershipExpiresAt = nextBilling;
            console.log(
              `[Webhook PayPal] Suscripción cancelada para usuario: ${user.email}. Acceso conservado hasta fin de periodo: ${nextBilling.toLocaleDateString('es-ES')}`
            );
          } else if (!user.membershipExpiresAt || new Date(user.membershipExpiresAt) <= new Date()) {
            user.membership = 'free';
            user.subscriptionId = null;
            console.log(`[Webhook PayPal] Suscripción expirada/cancelada para usuario: ${user.email}. Acceso revocado.`);
          } else {
            console.log(
              `[Webhook PayPal] Suscripción cancelada para usuario: ${user.email}. Acceso conservado hasta fecha previa: ${new Date(user.membershipExpiresAt).toLocaleDateString('es-ES')}`
            );
          }
          await user.save();
        }
      }
    } else if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const customIdStr = resource.custom_id;

      if (customIdStr) {
        let metadata = null;
        try {
          metadata = JSON.parse(customIdStr);
        } catch (e) {
          // ignore
        }

        if (metadata && metadata.paymentType === 'one-time-purchase') {
          const user = await User.findById(metadata.userId);
          if (user) {
            // Securizar: Verificar en API
            try {
              const accessToken = await getPayPalAccessToken();
              const baseUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
              const orderRes = await axios.get(`${baseUrl}/v2/checkout/orders/${resource.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (orderRes.data && orderRes.data.status === 'COMPLETED') {
                if (!user.purchasedItems.includes(metadata.contentId)) {
                  user.purchasedItems.push(metadata.contentId);
                  await user.save();
                  
                  // Record Transaction for One-Time Purchase
                  try {
                    const amount = resource.amount?.value || 0;
                    const currency = resource.amount?.currency_code || 'USD';
                    await Transaction.create({
                      user: user._id,
                      amount: Number(amount),
                      currency,
                      platform: 'paypal',
                      type: 'one-time-purchase',
                      content: metadata.contentId,
                      externalId: resource.id
                    });
                  } catch (txErr) {
                    console.error('[Webhook PayPal] Error al registrar Transaction:', txErr.message);
                  }

                  console.log(`[Webhook PayPal] Compra (verificada) con éxito para: ${user.email} | Contenido: ${metadata.contentId}`);
                  
                  // Notify admin
                  const adminSubject = `Nueva Compra de Contenido: ${user.name}`;
                  const adminHtml = `
                    <div style="font-family: sans-serif; color: #334155; padding: 20px;">
                      <h2 style="color: #3b82f6;">Nueva Compra (PayPal)</h2>
                      <p>El siguiente usuario ha comprado un contenido de pago único.</p>
                      <ul>
                        <li><strong>Nombre:</strong> ${user.name}</li>
                        <li><strong>Email:</strong> ${user.email}</li>
                        <li><strong>ID Contenido:</strong> ${metadata.contentId}</li>
                      </ul>
                    </div>
                  `;
                  import('../utils/emailService.js').then(({ sendAdminNotification }) => {
                    sendAdminNotification(adminSubject, adminHtml).catch(console.error);
                  });
                }
              }
            } catch (err) {
              console.error(`[Webhook PayPal] Error verificando orden ${resource.id} en API:`, err.message);
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
