// Helper utility to calculate course 1-year validity, exact expiry date, month & year

export function getCourseValidityInfo(enrolledAtInput) {
  const enrolledAtDate = enrolledAtInput ? new Date(enrolledAtInput) : new Date();
  
  // Expiry is exactly 1 year (365 days) from enrollment date
  const expiresAtDate = new Date(enrolledAtDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const isExpired = now > expiresAtDate;
  
  const diffTime = expiresAtDate.getTime() - now.getTime();
  const daysRemaining = isExpired ? 0 : Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const formattedEnrolledAt = enrolledAtDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedExpiresAt = expiresAtDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const validUntilMonthYear = expiresAtDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return {
    enrolledAt: enrolledAtDate,
    expiresAt: expiresAtDate,
    formattedEnrolledAt,
    formattedExpiresAt,
    validUntilMonthYear,
    daysRemaining,
    isExpired,
    validityDurationText: '1 Year Full Access (365 Days)'
  };
}
