/**
 * Validation utilities for common data types
 */

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Check if an email address is valid
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a username is valid (alphanumeric, underscore, hyphen)
 * @param {string} username - The username to validate
 * @returns {boolean} - True if valid username format
 */
export const isValidUsername = (username) => {
  if (!username || typeof username !== "string") return false;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Check if a password meets minimum requirements
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid password
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 6;
};

/**
 * Sanitize user input by removing potential XSS characters
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/[<>'"]/g, "") // Remove potential XSS characters
    .trim();
};

/**
 * Validate a URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL format
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a string contains only safe characters for display
 * @param {string} text - The text to validate
 * @returns {boolean} - True if safe for display
 */
export const isSafeText = (text) => {
  if (!text || typeof text !== "string") return false;
  // Allow letters, numbers, spaces, and common punctuation
  const safeTextRegex = /^[a-zA-Z0-9\s.,!?;:()\-_'"@#$%&*+=\[\]{}|\\\/~`^]*$/;
  return safeTextRegex.test(text);
};

export default {
  isValidObjectId,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  sanitizeInput,
  isValidUrl,
  isSafeText,
};
