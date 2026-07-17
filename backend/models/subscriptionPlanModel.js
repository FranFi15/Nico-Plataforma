import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Suscripción Mensual'
    },
    description: {
      type: String,
      default: 'Acceso exclusivo de la plataforma.'
    },
    // Mercado Pago
    mpAmount: {
      type: Number,
      default: 1990
    },
    mpCurrency: {
      type: String,
      default: 'ARS'
    },
    mpReason: {
      type: String,
      default: 'Suscripción Mensual'
    },
    // PayPal
    paypalPlanId: {
      type: String,
      default: ''
    },
    paypalAmount: {
      type: Number,
      default: 15
    },
    paypalCurrency: {
      type: String,
      default: 'USD'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
