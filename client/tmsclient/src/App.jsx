import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import { authService } from './services/authService';
import './App.css';

function App() {
  const getDefaultRoute = () => {
    if (!authService.isAuthenticated()) return <Login />;
    const role = localStorage.getItem('role');
    if (role === 'Admin' || role === 'SystemAdmin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={getDefaultRoute()}
        />
        <Route
          path="/signup"
          element={
            authService.isAuthenticated() ? <Navigate to="/dashboard" /> : <Signup />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
