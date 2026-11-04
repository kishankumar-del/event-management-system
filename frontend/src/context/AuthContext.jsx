import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('ems_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ems_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Logout action: clears state and localStorage
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
    } catch (err) {
      console.warn('Failed to clean localStorage:', err);
    }
    setToken(null);
    setUser(null);
  }, []);

  // Listen to 401 unauthorized events emitted from fetch wrapper
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('ems:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ems:unauthorized', handleUnauthorized);
  }, [logout]);

  // Verify and refresh current profile on initial mount if token exists
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (isMounted && res.data?.user) {
          setUser(res.data.user);
          try {
            localStorage.setItem('ems_user', JSON.stringify(res.data.user));
          } catch {}
        }
      } catch (err) {
        // If /auth/me fails (token expired/invalid), logout is handled
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, data } = res;
    const loggedUser = data.user;

    try {
      localStorage.setItem('ems_token', receivedToken);
      localStorage.setItem('ems_user', JSON.stringify(loggedUser));
    } catch (err) {
      console.warn('Unable to persist session to localStorage:', err);
    }

    setToken(receivedToken);
    setUser(loggedUser);
    return loggedUser;
  };

  // Register handler
  const register = async ({ name, email, password, role }) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token: receivedToken, data } = res;
    const registeredUser = data.user;

    try {
      localStorage.setItem('ems_token', receivedToken);
      localStorage.setItem('ems_user', JSON.stringify(registeredUser));
    } catch (err) {
      console.warn('Unable to persist session to localStorage:', err);
    }

    setToken(receivedToken);
    setUser(registeredUser);
    return registeredUser;
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

