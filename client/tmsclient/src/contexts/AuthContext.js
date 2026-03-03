import React from 'react';

const { createContext, useContext, useState, useCallback, useEffect } = React;

const AuthContext = createContext();

const API_URL = 'http://localhost:5011/api/auth';

export function AuthProvider(props) {
  const { children } = props;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function () {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async function (identifier, password) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier.trim(), password: password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();

      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        identityNumber: data.identityNumber,
        role: data.role,
        isApproved: data.isApproved,
        approvedAt: data.approvedAt
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(data.token);
      setUser(userData);

      return { success: true, user: userData };

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async function (username, identityNumber, email, password, confirmPassword) {
    setLoading(true);
    setError(null);

    const cleanUsername = username.trim();
    const cleanIdentityNumber = identityNumber.trim();
    const cleanEmail = email.trim();

    try {
      const response = await fetch(API_URL + '/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          identityNumber: cleanIdentityNumber,
          email: cleanEmail,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Signup failed');
      }

      return { success: true };

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(function () {
    localStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return React.createElement(
    AuthContext.Provider,
    { value: { user, token, loading, error, isAuthenticated, login, signup, logout } },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}