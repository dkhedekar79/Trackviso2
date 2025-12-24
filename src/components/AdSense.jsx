import React, { useEffect } from 'react';

/**
 * AdSense Component
 * Displays Google AdSense ads on both public and private pages
 * 
 * @param {string} slotId - Optional AdSense slot ID (for specific ad units)
 * @param {string} format - Ad format: 'auto', 'rectangle', 'horizontal', 'vertical'
 * @param {string} style - Inline styles for the ad container
 * @param {string} className - CSS classes for the ad container
 */
const AdSense = ({ 
  slotId = null, 
  format = 'auto',
  style = {},
  className = '',
  adSlot = null // For specific ad slot numbers
}) => {
  useEffect(() => {
    try {
      // Push ad to AdSense
      if (window.adsbygoogle && window.adsbygoogle.loaded !== true) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const adStyle = {
    display: 'block',
    textAlign: 'center',
    minHeight: format === 'horizontal' ? '90px' : format === 'vertical' ? '250px' : '100px',
    ...style
  };

  return (
    <div className={`adsense-container ${className}`} style={adStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9570335781120627"
        data-ad-slot={slotId || adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;

