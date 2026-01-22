/**
 * Utility helper functions
 * Pure functions with no side effects
 */

import { GAME_CONFIG } from "../config/game-config.js";

/**
 * Format a currency amount as "$X.X B" or "$X.X T" for trillions
 * @param {number} amount - Amount in billions
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (amount >= 1000) {
    return `${GAME_CONFIG.currencySymbol}${(amount / 1000).toFixed(1)} T`;
  }
  return `${GAME_CONFIG.currencySymbol}${amount.toFixed(1)} ${GAME_CONFIG.currencyUnit}`;
}

/**
 * Format construction time in a human-readable format
 * @param {number} months - Duration in months
 * @returns {string} Formatted time string (e.g., "2y 6mo")
 */
export function formatConstructionTime(months) {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years}y`;
    }
    return `${years}y ${remainingMonths}mo`;
  }
  return `${months}mo`;
}

/**
 * Generate a simple hash from a string
 * Used for deterministic pseudo-random offsets
 * @param {string} value - String to hash
 * @returns {number} Hash value (0-99999)
 */
export function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
}

/**
 * Format a percentage value for display
 * @param {number} value - Decimal value (0.0 - 1.0)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Deep clone an object (simple implementation)
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format month number (1-12) and year into display string
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year
 * @returns {string} Formatted date string
 */
export function formatMonthYear(month, year) {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${monthNames[month - 1]} ${year}`;
}
