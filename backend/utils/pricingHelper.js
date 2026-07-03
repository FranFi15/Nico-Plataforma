/**
 * Calculates the final price of content for a given user, applying premium/subscriber discounts.
 * 
 * @param {Object} user - The User document or object.
 * @param {Object} content - The Content document or object.
 * @returns {Number} - The final price after discounts.
 */
export const calculatePrice = (user, content, currency = 'USD') => {
  const basePrice = currency === 'ARS' 
    ? (content.priceArs || 0) 
    : (content.priceUsd !== undefined ? content.priceUsd : (content.price || 0));

  // Rule: Apply 20% discount if the content requires a purchase and the user is premium or subscribed
  if (
    content.accessType === 'one-time-purchase' &&
    (user.membership === 'premium' || user.isSubscribed === true)
  ) {
    const discountPercentage = 20; // 20% discount
    const discount = (basePrice * discountPercentage) / 100;
    return basePrice - discount;
  }

  // Otherwise return full price
  return basePrice;
};
