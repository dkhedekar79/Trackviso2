import React, { useEffect, useRef } from 'react';

/**
 * AdMaven Component
 * Displays AdMaven ads on both public and private pages
 * 
 * @param {string} placementId - AdMaven placement ID (defaults to meta tag value)
 * @param {string} format - Ad format: 'popup', 'banner', 'interstitial', 'auto'
 * @param {string} style - Inline styles for the ad container
 * @param {string} className - CSS classes for the ad container
 */
const AdMaven = ({ 
  placementId = 'Bqjw9rTw8', // Default from meta tag
  format = 'auto',
  style = {},
  className = ''
}) => {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if AdMaven script is already loaded
    if (scriptLoadedRef.current) return;

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
  }, [placementId]);

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

