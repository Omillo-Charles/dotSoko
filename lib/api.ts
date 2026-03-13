import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1";

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle network errors or timeouts with exponential backoff retry
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
    if (isNetworkError && config && !config._isRetry) {
      config._isRetry = true;
      config._retryCount = (config._retryCount || 0) + 1;

      if (config._retryCount <= 3) {
        const delay = config._retryCount * 1500; // 1.5s, 3s, 4.5s
        console.warn(`[API] Network error. Retry attempt ${config._retryCount} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Handle global errors like 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.startsWith('/auth');
        if (!isAuthPage) {
          console.warn('[API] 401 Unauthorized detected. Clearing session.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          // Optional: Only redirect manually if necessary, or let components handle it via hooks
          // window.location.href = '/auth?mode=login';
        }
      }
    }
    
    // Standardized error message extraction from backend response
    const backendMessage = error.response?.data?.message;
    const backendErrors = error.response?.data?.errors;
    
    // Attach friendly message and structured errors to the error object
    error.friendlyMessage = backendMessage || error.message || "An unexpected error occurred";
    error.backendErrors = backendErrors;

    return Promise.reject(error);
  }
);

export default api;
