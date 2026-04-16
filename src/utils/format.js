/**
 * Shared formatting utilities used across views.
 * Eliminates duplicated formatDate / formatNumber logic.
 */

/**
 * Format a date string to Russian locale date.
 * @param {string|null} dateStr - ISO date string or null
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU");
}

/**
 * Format a number with Russian locale grouping.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return new Intl.NumberFormat("ru-RU").format(n);
}
