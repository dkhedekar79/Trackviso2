/**
 * Optimistic update utilities
 * Updates UI immediately, rolls back on error
 */

import logger from './logger';

/**
 * Create an optimistic update function
 */
export const createOptimisticUpdate = (updateFn, rollbackFn) => {
  return async (...args) => {
    // Store previous state for rollback
    const previousState = updateFn(...args);
    
    try {
      // Perform actual update (e.g., API call)
      const result = await rollbackFn(...args);
      return result;
    } catch (error) {
      logger.error('Optimistic update failed, rolling back:', error);
      // Rollback to previous state
      if (typeof previousState === 'function') {
        previousState();
      }
      throw error;
    }
  };
};

/**
 * Optimistic array update
 */
export const optimisticArrayUpdate = (setState, item, addFn, removeFn) => {
  // Optimistically add item
  setState(prev => [...prev, item]);
  
  return addFn(item)
    .then(result => {
      // Update with server response
      setState(prev => prev.map(i => i.id === item.id ? result : i));
      return result;
    })
    .catch(error => {
      // Rollback on error
      setState(prev => prev.filter(i => i.id !== item.id));
      throw error;
    });
};

/**
 * Optimistic array removal
 */
export const optimisticArrayRemove = (setState, itemId, removeFn) => {
  // Store item for rollback
  let removedItem = null;
  
  // Optimistically remove item
  setState(prev => {
    removedItem = prev.find(i => i.id === itemId);
    return prev.filter(i => i.id !== itemId);
  });
  
  return removeFn(itemId)
    .catch(error => {
      // Rollback on error
      if (removedItem) {
        setState(prev => [...prev, removedItem]);
      }
      throw error;
    });
};

export default {
  createOptimisticUpdate,
  optimisticArrayUpdate,
  optimisticArrayRemove
};

