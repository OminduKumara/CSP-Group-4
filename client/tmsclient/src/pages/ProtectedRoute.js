import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function normalizeRole(role) {
  if (role == null) return '';
  return String(role).trim().toLowerCase();
}

export default function ProtectedRoute(props) {
  const { children, roles, redirectTo = '/dashboard' } = props;
  const auth = useAuth();

  if (auth.loading) {
    return React.createElement('div', null, 'Loading...');
  }

  if (!auth.isAuthenticated) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  if (roles) {
    const required = Array.isArray(roles) ? roles : [roles];
    const requiredNormalized = required.map(normalizeRole);
    const userRole = normalizeRole(auth.user?.role);
    if (!requiredNormalized.includes(userRole)) {
      return React.createElement(Navigate, { to: redirectTo, replace: true });
    }
  }

  return children;
}