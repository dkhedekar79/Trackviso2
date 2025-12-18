/**
 * Centralized validation utilities
 */

export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email is required' };
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }
  return { valid: true };
};

export const validateTask = (task) => {
  const errors = [];
  
  if (!task.name || !task.name.trim()) {
    errors.push('Task name is required');
  }
  
  if (task.name && task.name.length > 200) {
    errors.push('Task name is too long (max 200 characters)');
  }
  
  if (!task.subject || !task.subject.trim()) {
    errors.push('Subject is required');
  }
  
  if (!task.time || parseInt(task.time) < 1) {
    errors.push('Duration must be at least 1 minute');
  }
  
  if (task.time && parseInt(task.time) > 1440) {
    errors.push('Duration cannot exceed 24 hours (1440 minutes)');
  }
  
  if (task.recurrence === 'weekly' && (!task.recurrenceDays || task.recurrenceDays.length === 0)) {
    errors.push('Please select at least one day for weekly recurrence');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

export const sanitizeHtml = (html) => {
  // For now, just strip script tags
  // In production, use DOMPurify
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export default {
  validateEmail,
  validatePassword,
  validateTask,
  sanitizeInput,
  sanitizeHtml
};

