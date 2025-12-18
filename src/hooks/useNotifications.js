import { useEffect, useState, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Hook for browser notifications
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState('Notification' in window);

  useEffect(() => {
    if (!isSupported) {
      logger.warn('Browser notifications not supported');
      return;
    }

    setPermission(Notification.permission);
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, permission]);

  const showNotification = useCallback((title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      logger.warn('Cannot show notification: permission not granted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: options.tag || 'default',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        ...options
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) {
          options.onClick();
        }
      };

      return notification;
    } catch (error) {
      logger.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification
  };
};

export default useNotifications;

