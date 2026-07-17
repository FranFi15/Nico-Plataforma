import SubscriptionPlan from '../models/subscriptionPlanModel.js';

// @desc    Get subscription plan settings
// @route   GET /api/subscription-plan
// @access  Public
export const getSubscriptionPlan = async (req, res, next) => {
  try {
    let plan = await SubscriptionPlan.findOne({});
    if (!plan) {
      plan = await SubscriptionPlan.create({});
    }
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription plan settings
// @route   PUT /api/subscription-plan
// @access  Private/Admin
export const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const {
      title,
      description,
      mpAmount,
      mpCurrency,
      mpReason,
      paypalPlanId,
      paypalAmount,
      paypalCurrency,
      isActive
    } = req.body;

    let plan = await SubscriptionPlan.findOne({});
    if (!plan) {
      plan = new SubscriptionPlan({});
    }

    if (title !== undefined) plan.title = title;
    if (description !== undefined) plan.description = description;
    if (mpAmount !== undefined) plan.mpAmount = Number(mpAmount);
    if (mpCurrency !== undefined) plan.mpCurrency = mpCurrency;
    if (mpReason !== undefined) plan.mpReason = mpReason;
    if (paypalPlanId !== undefined) plan.paypalPlanId = paypalPlanId;
    if (paypalAmount !== undefined) plan.paypalAmount = Number(paypalAmount);
    if (paypalCurrency !== undefined) plan.paypalCurrency = paypalCurrency;
    if (isActive !== undefined) plan.isActive = Boolean(isActive);

    const updatedPlan = await plan.save();

    res.status(200).json({
      success: true,
      message: 'Configuración de suscripción actualizada con éxito',
      data: updatedPlan
    });
  } catch (error) {
    next(error);
  }
};
