import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function isAdminRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return <Login />;
    if (isAdminRole(user?.role)) {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/dashboard" />;
  };

  return (
    <Routes>
      {/* 1. Updated the base route to render the Landing Page */}
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={getDefaultRoute()}
      />
      <Route
        path="/signup"
        element={
          isAuthenticated
            ? (isAdminRole(user?.role) ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)
            : <Signup />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["Player"]} redirectTo="/admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["Admin","SystemAdmin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* 2. Updated fallback to catch bad URLs and send them home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;