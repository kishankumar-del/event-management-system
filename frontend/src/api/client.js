const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal fetch wrapper for API communication.
 * Manages Authorization headers, 401 interception, and error formatting.
 */
export async function apiRequest(endpoint, options = {}) {
  const { body, headers = {}, method = 'GET', ...rest } = options;

  let token = null;
  try {
    token = localStorage.getItem('ems_token');
  } catch (err) {
    console.warn('Unable to access localStorage:', err);
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  // Remove Content-Type if sending FormData or body is absent
  if (!body) {
    delete defaultHeaders['Content-Type'];
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    // Check for 401 Unauthorized
    if (response.status === 401) {
      try {
        localStorage.removeItem('ems_token');
        localStorage.removeItem('ems_user');
      } catch (err) {
        // ignore
      }
      window.dispatchEvent(new CustomEvent('ems:unauthorized'));
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // If server returned HTML (e.g. Netlify SPA fallback for /api or 404 page)
      if (text.trim().startsWith('<!doctype html>') || text.trim().startsWith('<html')) {
        const error = new Error('Received HTML instead of JSON. Ensure VITE_API_URL in Netlify is set to your live Render backend URL (e.g. https://your-backend.onrender.com/api).');
        error.status = response.status;
        throw error;
      }
      data = { message: text };
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const isLocalApi = url.includes('localhost') || url.includes('127.0.0.1');
      if (isHttps && isLocalApi) {
        error.message = 'Unable to connect to backend: The site is running on HTTPS, but your API URL points to local HTTP (localhost). Set VITE_API_URL in Netlify to your live Render backend URL.';
      } else if (!url.startsWith('http')) {
        error.message = 'Backend API is unreachable: VITE_API_URL is not configured in your deployment settings. Please set VITE_API_URL to your backend URL in Netlify.';
      } else {
        error.message = 'Backend API is unreachable. If your backend is hosted on Render Free tier, it may be waking up from sleep (takes 30-50s) — please refresh in a moment, or verify your backend CORS settings.';
      }
    }
    // Re-throw standardized error
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

