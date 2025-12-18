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
 * Calculate payment statistics
 * @param {Array} payments - Array of payment objects
 * @returns {Object} { total, thisMonth, count }
 */
export const calculatePaymentStats = (payments) => {
  return {
    total: calculateTotal(payments),
    thisMonth: calculateThisMonth(payments),
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
