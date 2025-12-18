/**
 * Centralized logging utility
 * Automatically removes logs in production builds
 */
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log('[LOG]', ...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
    // TODO: Send to error tracking service (Sentry, etc.)
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },
  
  info: (...args) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },
  
  debug: (...args) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  group: (label) => {
    if (isDev) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },
  
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  }
};

export default logger;

