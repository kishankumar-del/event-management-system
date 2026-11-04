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

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    return data;
  } catch (error) {
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

