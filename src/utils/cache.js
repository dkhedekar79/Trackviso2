/**
 * Simple caching utility
 * Stores data in memory with TTL (time to live)
 */

import logger from './logger';
import { APP_CONFIG } from '../constants/appConfig';

class Cache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in cache
   */
  set(key, value, ttl = APP_CONFIG.CACHE_TTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Get a value from cache
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      // Expired, remove it
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }
}

// Singleton instance
const cache = new Cache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  cache.clearExpired();
}, 5 * 60 * 1000);

export default cache;

