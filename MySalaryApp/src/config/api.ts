// API Configuration
// This file contains static API configuration that should not change

export const API_CONFIG = {
  // Main server URL - For iOS Simulator use localhost
  BASE_URL: 'http://localhost:3001/api',

  // Alternative URLs for different environments
  NETWORK_URL: 'http://192.168.100.24:3001/api', // For real device

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Export the active configuration
export const API_BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;
