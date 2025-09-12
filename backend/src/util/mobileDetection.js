/**
 * Utility functions for detecting mobile requests
 */

/**
 * Determines if the request is from a mobile client
 * @param {Object} req - Express request object
 * @returns {boolean} True if the request is from a mobile client
 */
export const isMobileRequest = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const hasAuthHeader = req.headers['authorization']?.startsWith('Bearer');
  const hasRefreshHeader = req.headers['refresh']?.startsWith('Bearer');

  // More reliable mobile detection
  const mobileIndicators = [
    'ReactNative',
    'Expo',
    'okhttp',
    'CFNetwork', // iOS
    'Mobile', // Generic mobile
    'AI-Journaling' // Your custom user agent
  ];

  const isMobileUserAgent = mobileIndicators.some(indicator =>
    userAgent.includes(indicator)
  );

  // If using Bearer tokens or mobile user agent, treat as mobile
  return hasAuthHeader || hasRefreshHeader || isMobileUserAgent;
};
