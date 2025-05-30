// API configuration utility
export const getApiUrl = (path: string = '') => {
  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined';
  
  let baseUrl: string;
  
  if (isBrowser) {
    // Browser environment - use current hostname with backend port
    // Handle special case where 0.0.0.0 gets blocked by browsers
    let currentHostname = '57.155.0.162:8000';
    
    // If hostname is 0.0.0.0, use the external IP instead
    if (currentHostname === '0.0.0.0') {
      currentHostname = '4.237.56.73'; // Use the server's external IP
    }
    
    baseUrl = `http://${currentHostname}`;
    
    console.log(`Browser API URL: ${baseUrl}${path} (hostname: ${window.location.hostname} -> ${currentHostname})`);
  } else {
    // Server-side environment - use environment variable or Docker service name
    baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
    console.log(`Server API URL: ${baseUrl}${path}`);
  }
  
  return `${baseUrl}${path}`;
};

// For convenience, export commonly used API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  login: '/api/auth/login',
  register: '/api/auth/register',
  googleLogin: '/api/auth/google-login',
  user: '/api/auth/user',
  changePassword: '/api/auth/change-password',
  updateProfile: '/api/auth/update-profile',
  speechHistory: '/api/auth/speech-history',
  
  // TTS endpoints
  textToSpeech: '/api/text-to-speech',
  audio: '/api/audio',
  
  // Voice endpoints
  uploadVoice: '/api/upload-voice',
  loadModel: '/api/load-model',
};

// Helper function to make API calls with proper error handling
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    throw error;
  }
}; 