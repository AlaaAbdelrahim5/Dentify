/**
 * Payment utility functions for calculating statistics
 */

/**
 * Calculate total amount from payments array
 */
export const calculateTotal = (payments) => {
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
};

/**
 * Calculate total amount for this month's payments
 */
export const calculateThisMonth = (payments) => {
  const now = new Date();
  return payments
    .filter(p => {
      const date = new Date(p.paymentDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);
};

/**
 * Calculate remaining balance from treatments
 * @param {Array} treatments - Array of treatment objects with totalAmount and paidAmount
 * @returns {number} Total remaining balance
 */
export const calculateRemaining = (treatments) => {
  return treatments.reduce((sum, t) => {
    const remaining = (t.totalAmount || 0) - (t.paidAmount || 0);
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);
};

/**
 * Calculate payment statistics
 * @param {Array} payments - Array of payment objects
 * @param {Array} treatments - Optional array of treatment objects for calculating remaining balance
 * @returns {Object} { total, thisMonth, remaining, count }
 */
export const calculatePaymentStats = (payments, treatments = []) => {
  return {
    total: calculateTotal(payments),
    thisMonth: calculateThisMonth(payments),
    remaining: calculateRemaining(treatments),
    count: payments.length
  };
};

/**
 * Check if a date is in the current month
 */
export const isCurrentMonth = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};
