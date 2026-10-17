const STAFF_ROLES = ['admin', 'professor', 'profe', 'instructor'];

export const isStaff = (user) => Boolean(user && STAFF_ROLES.includes(user.role));

export const isActivePremium = (user) => {
  if (!user) return false;
  const premium = user.membership === 'premium' || user.isSubscribed === true;
  const expired = user.membershipExpiresAt && new Date(user.membershipExpiresAt) < new Date();
  return premium && !expired;
};

export const userOwnsContent = (user, contentId) => {
  if (!user || !Array.isArray(user.purchasedItems) || contentId == null) return false;
  const target = String(contentId);
  return user.purchasedItems.some((item) => {
    const id = item && item._id != null ? item._id : item;
    return id != null && String(id) === target;
  });
};

export const userHasContentAccess = (user, content) => {
  if (!content) return false;
  if (isStaff(user)) return true;
  if (content.isPublished === false || content.status === 'draft') return false;
  if (content.accessType === 'free') return true;
  if (!user) return false;
  if (content.accessType === 'subscription') return isActivePremium(user);
  if (content.accessType === 'one-time-purchase') {
    return userOwnsContent(user, content._id) || (content.allowPremiumAccess === true && isActivePremium(user));
  }
  return false;
};
