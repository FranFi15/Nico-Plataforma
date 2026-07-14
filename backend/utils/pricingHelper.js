/**
 * Calculates the final price of content for a given user, applying premium/subscriber discounts.
 * 
 * @param {Object} user - The User document or object.
 * @param {Object} content - The Content document or object.
 * @returns {Number} - The final price after discounts.
 */
export const calculatePrice = (user, content, currency = 'USD', couponDiscountPercentage = 0) => {
  let finalPrice = currency === 'ARS' 
    ? (content.priceArs || 0) 
    : (content.priceUsd !== undefined ? content.priceUsd : (content.price || 0));

  // Rule: Apply member discount if the content requires a purchase and the user is premium or subscribed
  if (
    content.accessType === 'one-time-purchase' &&
    user && (user.membership === 'premium' || user.isSubscribed === true)
  ) {
    const memberDiscountPercentage = content.memberDiscountPercentage !== undefined && content.memberDiscountPercentage !== null && content.memberDiscountPercentage !== '' 
      ? Number(content.memberDiscountPercentage) 
      : 0;
    if (memberDiscountPercentage > 0) {
      finalPrice = finalPrice * (1 - memberDiscountPercentage / 100);
    }
  }

  // Rule: Apply coupon discount if provided
  if (couponDiscountPercentage > 0) {
    finalPrice = finalPrice * (1 - couponDiscountPercentage / 100);
  }

  return Math.round(finalPrice * 100) / 100;
};
