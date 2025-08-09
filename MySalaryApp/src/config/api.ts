// API Configuration
// This file contains static API configuration that should not change

export const API_CONFIG = {
  // Main server URL - UPDATED TO CURRENT IP ADDRESS
  BASE_URL: 'http://192.168.31.132:3001/api',

  // Alternative URLs for different environments
  LOCALHOST_URL: 'http://localhost:3001/api', // For Android emulator

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
