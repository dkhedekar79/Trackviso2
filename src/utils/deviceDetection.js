/**
 * Detects if the user is on a mobile device
 * @returns {boolean} True if mobile device, false otherwise
 */
export const isMobileDevice = () => {
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Common mobile device patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check screen width (mobile devices typically have smaller screens)
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check for touch support (most mobile devices have touch)
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Combine checks: user agent OR (small screen AND touch support)
  return mobileRegex.test(userAgent) || (isSmallScreen && hasTouchScreen);
};

