import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api/v1";

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // needed so the httpOnly refreshToken cookie is sent on /auth/refresh
  timeout: 30000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the access token from localStorage to every outgoing request.
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

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // 1. Network / timeout retry with exponential back-off (up to 3 attempts)
    const isNetworkError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK';

    if (isNetworkError && config) {
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= 3) {
        const delay = config._retryCount * 1500; // 1.5 s → 3 s → 4.5 s
        console.warn(`[API] Network error. Retry ${config._retryCount}/3 in ${delay}ms…`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // 2. Silent token refresh on 401
    //    Only attempt once per request (_isRefreshRetry guard) and skip the
    //    auth page itself to avoid redirect loops.
    if (
      error.response?.status === 401 &&
      config &&
      !config._isRefreshRetry
    ) {
      config._isRefreshRetry = true;

      if (typeof window !== 'undefined') {
        const onAuthPage = window.location.pathname.startsWith('/auth');
        const isSocialFlow = window.location.search.includes('mode=social-success');

        if (!onAuthPage && !isSocialFlow) {
          try {
            // Use plain axios (not the api instance) to avoid interceptor loops.
            // The httpOnly refreshToken cookie is sent automatically.
            const refreshRes = await axios.post(
              `${apiUrl}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const newToken: string | undefined = refreshRes.data?.accessToken;
            if (newToken) {
              localStorage.setItem('accessToken', newToken);
              window.dispatchEvent(new Event('auth-change'));
              // Retry the original request with the fresh token
              config.headers.Authorization = `Bearer ${newToken}`;
              return api(config);
            }
          } catch {
            // Refresh also failed — force logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-change'));
          }
        }
      }
    }

    // 3. Standardised, user-friendly error messages
    const backendMessage = error.response?.data?.message;
    const backendErrors  = error.response?.data?.errors;
    const statusCode     = error.response?.status;

    let friendlyMessage = backendMessage;

    if (!friendlyMessage) {
      switch (statusCode) {
        case 400: friendlyMessage = 'Invalid details provided. Please check your input and try again.'; break;
        case 401: friendlyMessage = 'Please log in to continue.'; break;
        case 403: friendlyMessage = 'You do not have permission to perform this action.'; break;
        case 404: friendlyMessage = 'The requested item was not found.'; break;
        case 409: friendlyMessage = 'This item already exists. Please use a different value.'; break;
        case 413: friendlyMessage = 'File is too large. Please upload a smaller file.'; break;
        case 429: friendlyMessage = 'Too many requests. Please wait a moment and try again.'; break;
        case 500: friendlyMessage = 'Something went wrong on our end. Please try again later.'; break;
        case 503: friendlyMessage = 'Service temporarily unavailable. Please try again in a few moments.'; break;
        default:  friendlyMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
    }

    error.friendlyMessage = friendlyMessage;
    error.backendErrors   = backendErrors;
    error.statusCode      = statusCode;

    return Promise.reject(error);
  }
);

export default api;
