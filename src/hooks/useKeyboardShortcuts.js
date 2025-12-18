import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';

/**
 * Global keyboard shortcuts hook
 * Must be used inside Router context
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K: Global search (future feature)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        logger.log('Global search shortcut pressed');
        // Dispatch event for toast notification (handled by components that have toast access)
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'Global search coming soon!', type: 'info' }
        }));
      }

      // Esc: Close modals (handled by individual components)
      if (e.key === 'Escape') {
        // Dispatch custom event for modals to listen to
        window.dispatchEvent(new CustomEvent('escape-pressed'));
      }

      // Cmd/Ctrl + /: Show keyboard shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'Keyboard shortcuts: Cmd+K (Search), Esc (Close modals)', type: 'info' }
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};

export default useKeyboardShortcuts;

