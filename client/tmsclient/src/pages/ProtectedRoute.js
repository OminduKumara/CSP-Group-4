import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  return children;
}
