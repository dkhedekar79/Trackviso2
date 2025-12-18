/**
 * Input sanitization utilities
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitize HTML content
 * Removes potentially dangerous HTML tags and attributes
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
};

/**
 * Sanitize plain text input
 * Removes HTML tags and dangerous characters
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Sanitize user input for database storage
 */
export const sanitizeInput = (input, options = {}) => {
  if (input === null || input === undefined) return input;
  
  const { 
    allowHtml = false, 
    maxLength = 10000,
    trim = true 
  } = options;
  
  let sanitized = typeof input === 'string' ? input : String(input);
  
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  if (allowHtml) {
    sanitized = sanitizeHtml(sanitized);
  } else {
    sanitized = sanitizeText(sanitized);
  }
  
  return sanitized;
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().replace(/[<>]/g, '');
};

/**
 * Sanitize URL
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
};

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeInput,
  sanitizeEmail,
  sanitizeUrl
};

