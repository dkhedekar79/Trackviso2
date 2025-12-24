import React, { useEffect, useRef } from 'react';

/**
 * AdMaven Component
 * Displays AdMaven ads on both public and private pages
 * 
 * @param {string} placementId - AdMaven placement ID (defaults to meta tag value)
 * @param {string} format - Ad format: 'popup', 'banner', 'interstitial', 'auto'
 * @param {string} style - Inline styles for the ad container
 * @param {string} className - CSS classes for the ad container
 * @param {number} popupFrequencyHours - Minimum hours between popups (default: 24, AdMaven's default)
 */
const AdMaven = ({ 
  placementId = 'Bqjw9rTw8', // Default from meta tag
  format = 'auto',
  style = {},
  className = '',
  popupFrequencyHours = 24 // Default: once per 24 hours (AdMaven's default)
}) => {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if AdMaven script is already loaded
    if (scriptLoadedRef.current) return;

    // For popup ads, check frequency before loading
    if (format === 'popup' || format === 'auto') {
      const lastPopupTime = localStorage.getItem('admaven_last_popup');
      const now = Date.now();
      
      if (lastPopupTime) {
        const hoursSinceLastPopup = (now - parseInt(lastPopupTime)) / (1000 * 60 * 60);
        if (hoursSinceLastPopup < popupFrequencyHours) {
          // Too soon, skip loading popup script
          console.log(`AdMaven popup skipped: ${hoursSinceLastPopup.toFixed(1)} hours since last popup (minimum: ${popupFrequencyHours} hours)`);
          return;
        }
      }
      
      // Track popup time (will be set when popup actually shows)
      // Note: AdMaven's script handles the actual popup, we just track it
      const handlePopup = () => {
        localStorage.setItem('admaven_last_popup', now.toString());
      };
      
      // Listen for AdMaven popup events (if they fire custom events)
      window.addEventListener('admaven-popup', handlePopup);
      
      // Fallback: set timestamp after a delay (assuming popup might show)
      setTimeout(() => {
        localStorage.setItem('admaven_last_popup', now.toString());
      }, 2000);
    }

    // Load AdMaven script
    const script = document.createElement('script');
    script.src = `https://aringours.com/?tid=${placementId}`;
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    script.onerror = (error) => {
      console.error('AdMaven script failed to load:', error);
    };

    // Add script to head
    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Don't remove script on cleanup to avoid reloading
      // The script will handle its own cleanup
    };
  }, [placementId, format, popupFrequencyHours]);

  // For banner/display ads, render a container
  if (format === 'banner' || format === 'auto') {
    return (
      <div 
        ref={containerRef}
        className={`admaven-container ${className}`}
        style={{
          display: 'block',
          textAlign: 'center',
          minHeight: '100px',
          ...style
        }}
        data-admaven-placement={placementId}
      >
        {/* AdMaven will inject content here via their script */}
      </div>
    );
  }

  // For popup/interstitial ads, AdMaven handles them automatically
  // No container needed, they're triggered by AdMaven's script
  return null;
};

export default AdMaven;

