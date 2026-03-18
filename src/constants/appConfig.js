/**
 * Centralized application configuration
 * All magic numbers, strings, and constants should be defined here
 */

export const APP_CONFIG = {
  // XP System
  XP_PER_MINUTE: 10,
  XP_BASE_RATE: 600, // XP per hour
  FOCUS_MULTIPLIER_THRESHOLDS: {
    SHORT: 25, // minutes
    MEDIUM: 60,
    LONG: 120
  },
  FOCUS_MULTIPLIERS: {
    SHORT: 1.2,
    MEDIUM: 1.5,
    LONG: 2.0
  },
  MAX_STREAK_BONUS: 1.5, // +50% max
  STREAK_BONUS_DIVISOR: 60,
  MASTERY_BONUS_THRESHOLD: 10, // hours
  MASTERY_BONUS_PERCENT: 0.1, // 10%
  PRESTIGE_MULTIPLIER_PER_LEVEL: 0.1, // 10% per level
  PREMIUM_XP_MULTIPLIER: 1.2,
  
  // Streak System
  MAX_STREAK_SAVERS: 3,
  STREAK_SAVER_COST: 50, // gems
  
  // Quest System
  DAILY_QUEST_COUNT: 3,
  WEEKLY_QUEST_COUNT: 5,
  QUEST_RESET_TIME: '00:00', // UTC
  
  // Session Management
  SESSION_TIMEOUT: 10000, // 10 seconds
  DB_INIT_TIMEOUT: 8000, // 8 seconds
  SESSION_FETCH_TIMEOUT: 5000, // 5 seconds
  
  // Debouncing & Throttling
  DEBOUNCE_DELAY: 500,
  STORAGE_SAVE_DELAY: 500,
  SYNC_DEBOUNCE: 1000,
  SEARCH_DEBOUNCE: 300,
  
  // Task Management
  TASK_AUTO_DELETE_DAYS: 7,
  RECURRING_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
  
  // UI Constants
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  TRANSITION_DELAY: {
    SHORT: 100,
    MEDIUM: 300,
    LONG: 500
  },
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  INFINITE_SCROLL_THRESHOLD: 100, // pixels from bottom
  
  // File Limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // API Limits
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  STALE_WHILE_REVALIDATE: 10 * 60 * 1000, // 10 minutes
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STUDY: '/study',
  TASKS: '/tasks',
  SUBJECTS: '/subjects',
  SCHEDULE: '/schedule',
  INSIGHTS: '/insights',
  MASTERY: '/mastery',
  RESOURCES: '/resources',
  SETTINGS: '/settings',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PAYMENT: '/payment',
  ADMIN: '/admin'
};

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

export const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  SESSION_SAVED: 'Study session saved!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};

export default APP_CONFIG;

