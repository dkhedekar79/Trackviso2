import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import logger from '../utils/logger';

/**
 * Hook to detect online/offline status and handle offline mode
 */
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const { info, warning } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        info('You are back online!');
        setWasOffline(false);
        // Trigger sync of pending changes
        window.dispatchEvent(new Event('online-sync'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      warning('You are offline. Changes will be saved locally and synced when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, info, warning]);

  return { isOnline, wasOffline };
};

export default useOffline;

