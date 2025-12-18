import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

/**
 * Hook to track website time accurately using visibility API
 * Only counts time when the tab/window is visible and active
 */
export function useWebsiteTimeTracker() {
  const { user } = useAuth();
  const startTimeRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const isActiveRef = useRef(true);
  const intervalRef = useRef(null);
  const lastSaveTimeRef = useRef(Date.now());
  const canPersistRef = useRef(true); // disabled if schema doesn't support website_time_minutes

  useEffect(() => {
    if (!user) return;

    // Load existing website time from database
    const loadWebsiteTime = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('website_time_minutes, user_id')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors if record doesn't exist

        // If column doesn't exist yet (PGRST204) or RLS blocks access (PGRST301), stop trying to persist
        if (error?.code === 'PGRST204' || error?.code === 'PGRST301' || error?.code === 'PGRST116' || error?.code === 'PGRST406') {
          canPersistRef.current = false;
          logger.warn('Website time tracking disabled:', error.message || 'Schema issue');
          return;
        }

        if (!error && data?.website_time_minutes) {
          accumulatedTimeRef.current = data.website_time_minutes * 60; // Convert to seconds
        } else if (error) {
          // Handle schema errors gracefully
          if (error.code === 'PGRST204' || error.code === 'PGRST406') {
            canPersistRef.current = false;
            logger.warn('Website time column not available, tracking disabled');
          }
        }
      } catch (error) {
        logger.error('Error loading website time:', error);
        if (error.code === 'PGRST204' || error.code === 'PGRST406') {
          canPersistRef.current = false;
        }
      }
    };

    loadWebsiteTime();

    // Track visibility changes
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      
      if (isVisible && !isActiveRef.current) {
        // Tab became visible - start tracking
        isActiveRef.current = true;
        startTimeRef.current = Date.now();
      } else if (!isVisible && isActiveRef.current) {
        // Tab became hidden - save accumulated time
        isActiveRef.current = false;
        if (startTimeRef.current) {
          const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
          accumulatedTimeRef.current += sessionTime;
          startTimeRef.current = null;
          saveWebsiteTime();
        }
      }
    };

    // Track window focus/blur
    const handleFocus = () => {
      if (!isActiveRef.current) {
        isActiveRef.current = true;
        startTimeRef.current = Date.now();
      }
    };

    const handleBlur = () => {
      if (isActiveRef.current) {
        isActiveRef.current = false;
        if (startTimeRef.current) {
          const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
          accumulatedTimeRef.current += sessionTime;
          startTimeRef.current = null;
          saveWebsiteTime();
        }
      }
    };

    // Save website time to database periodically (every 30 seconds)
    const saveWebsiteTime = async () => {
      if (!user) return;
      if (!canPersistRef.current) return;

      try {
        const currentTime = Date.now();
        // Only save if at least 30 seconds have passed since last save
        if (currentTime - lastSaveTimeRef.current < 30000) {
          return;
        }

        // Calculate total time including current session
        let totalSeconds = accumulatedTimeRef.current;
        if (isActiveRef.current && startTimeRef.current) {
          totalSeconds += Math.floor((Date.now() - startTimeRef.current) / 1000);
        }

        const totalMinutes = Math.floor(totalSeconds / 60);

        // Update in database
        const { error } = await supabase
          .from('user_stats')
          .update({ 
            website_time_minutes: totalMinutes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          // Stop trying if column doesn't exist or RLS blocks access
          if (error?.code === 'PGRST204' || error?.code === 'PGRST301' || error?.code === 'PGRST116' || error?.code === 'PGRST406') {
            canPersistRef.current = false;
            return;
          }
          logger.error('Error saving website time:', error);
        } else {
          lastSaveTimeRef.current = currentTime;
        }
      } catch (error) {
        logger.error('Error saving website time:', error);
        if (error.code === 'PGRST204' || error.code === 'PGRST406') {
          canPersistRef.current = false;
        }
      }
    };

    // Initialize tracking
    if (document.visibilityState === 'visible') {
      startTimeRef.current = Date.now();
      isActiveRef.current = true;
    }

    // Set up periodic save (every 30 seconds)
    intervalRef.current = setInterval(saveWebsiteTime, 30000);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Save before page unload
    const handleBeforeUnload = () => {
      if (!canPersistRef.current) return;
      if (isActiveRef.current && startTimeRef.current && user) {
        const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        accumulatedTimeRef.current += sessionTime;
        
        // Use sendBeacon for reliable save on page unload
        const totalMinutes = Math.floor(accumulatedTimeRef.current / 60);
        const data = JSON.stringify({
          user_id: user.id,
          website_time_minutes: totalMinutes
        });
        
        // Use sendBeacon for reliable save on page unload (works even if page is closing)
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `${window.location.origin}/api/user/update-website-time`,
            new Blob([data], { type: 'application/json' })
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Save final time on cleanup
      if (isActiveRef.current && startTimeRef.current) {
        const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        accumulatedTimeRef.current += sessionTime;
        saveWebsiteTime();
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);
}

