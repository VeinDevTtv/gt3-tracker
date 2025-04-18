/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @param {string} locale - The locale (default: en-US)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number with commas for thousands separators
 * @param {number} number - The number to format
 * @param {string} locale - The locale (default: en-US)
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, locale = 'en-US') => {
  if (number === null || number === undefined) return '';
  
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {string} locale - The locale (default: en-US)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Format a date
 * @param {string|Date} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - The locale (default: en-US)
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}; 