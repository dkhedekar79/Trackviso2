/**
 * Unified data synchronization layer
 * Handles syncing between localStorage and Supabase with proper error handling
 */
import { debounce } from './debounce';
import logger from './logger';
import { 
  updateUserStats, 
  addStudySession, 
  upsertUserSubject, 
  upsertUserTask,
  updateTopicProgress 
} from './supabaseDb';

// Track sync status
const syncStatus = {
  pending: new Set(),
  syncing: false
};

/**
 * Sync data to Supabase with debouncing and error handling
 */
const syncToSupabase = async (data, type, userId) => {
  if (!userId) {
    logger.warn('Cannot sync: No user ID');
    return false;
  }

  try {
    syncStatus.syncing = true;
    
    let result = null;
    switch (type) {
      case 'userStats':
        result = await updateUserStats(data);
        break;
      case 'studySession':
        result = await addStudySession(data);
        break;
      case 'subject':
        result = await upsertUserSubject(data);
        break;
      case 'task':
        result = await upsertUserTask(data);
        break;
      case 'topicProgress':
        result = await updateTopicProgress(data.subject, data.progressData);
        break;
      default:
        logger.error(`Unknown sync type: ${type}`);
        return false;
    }

    if (result) {
      // Mark as synced in localStorage
      localStorage.setItem(`${type}_synced_${userId}`, Date.now().toString());
      syncStatus.pending.delete(`${type}_${data.id || data.user_id}`);
      logger.log(`✅ Synced ${type} to Supabase`);
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error(`Failed to sync ${type}:`, error);
    // Keep localStorage as backup
    localStorage.setItem(`${type}_sync_failed_${userId}`, JSON.stringify({
      data,
      error: error.message,
      timestamp: Date.now()
    }));
    return false;
  } finally {
    syncStatus.syncing = false;
  }
};

// Debounced sync functions
const debouncedSync = debounce(syncToSupabase, 1000);

/**
 * Sync data with automatic retry and fallback
 */
export const syncData = async (data, type, userId, options = {}) => {
  const { immediate = false, retries = 3 } = options;
  const syncKey = `${type}_${data.id || data.user_id}`;
  
  // Add to pending queue
  syncStatus.pending.add(syncKey);
  
  // Save to localStorage first (always)
  try {
    const storageKey = type === 'userStats' ? 'userStats' : `${type}s`;
    const existing = localStorage.getItem(storageKey);
    const items = existing ? JSON.parse(existing) : [];
    
    if (type === 'userStats') {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } else {
      const index = items.findIndex(item => item.id === (data.id || data.user_id));
      if (index >= 0) {
        items[index] = data;
      } else {
        items.push(data);
      }
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  } catch (error) {
    logger.error('Failed to save to localStorage:', error);
  }

  // Sync to Supabase
  if (immediate) {
    return await syncToSupabase(data, type, userId);
  } else {
    debouncedSync(data, type, userId);
    return true;
  }
};

/**
 * Retry failed syncs
 */
export const retryFailedSyncs = async (userId) => {
  if (!userId) return;
  
  const keys = Object.keys(localStorage);
  const failedSyncs = keys.filter(key => key.startsWith('task_sync_failed_') || 
                                         key.startsWith('subject_sync_failed_') ||
                                         key.startsWith('userStats_sync_failed_'));
  
  for (const key of failedSyncs) {
    try {
      const failed = JSON.parse(localStorage.getItem(key));
      const type = key.split('_sync_failed_')[0];
      
      logger.log(`Retrying failed sync: ${type}`);
      const success = await syncToSupabase(failed.data, type, userId);
      
      if (success) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      logger.error(`Failed to retry sync for ${key}:`, error);
    }
  }
};

/**
 * Check sync status
 */
export const getSyncStatus = () => {
  return {
    pending: syncStatus.pending.size,
    syncing: syncStatus.syncing
  };
};

export default {
  syncData,
  retryFailedSyncs,
  getSyncStatus
};

