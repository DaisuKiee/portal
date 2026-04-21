// API Configuration
// Update this IP address to match your backend server

export const API_CONFIG = {
  // Backend server URL
  BASE_URL: 'http://10.17.142.235:5000/api', //10.17.142.235 192.168.100.12
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper to get the full API URL
export const getApiUrl = () => {
  console.log('🌐 API URL:', API_CONFIG.BASE_URL);
  return API_CONFIG.BASE_URL;
};

export default API_CONFIG;
