
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LiveScoring from './pages/LiveScoring';
import LiveScoreView from './pages/LiveScoreView';
import InventoryPage from './pages/InventoryPage';
import PlayerProfile from './pages/PlayerProfile';
import PlayerAttendance from './pages/PlayerAttendance';
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
        path="/profile"
        element={
          <ProtectedRoute roles={["Player"]} redirectTo="/admin">
            <PlayerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute roles={["Player"]} redirectTo="/admin">
            <PlayerAttendance />
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
        <Route
          path="/admin/live-scoring/:urlTournamentId?/:urlMatchId?"
          element={
            <ProtectedRoute roles={["Admin","SystemAdmin"]}>
              <LiveScoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-score/:tournamentId/:matchId"
          element={<LiveScoreView />}
        />
      {/* 2. Updated fallback to catch bad URLs and send them home */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute roles={["Player","Admin","SystemAdmin"]}>
            <InventoryPage isAdmin={isAdminRole(user?.role)} userId={user?.id} />
          </ProtectedRoute>
        }
      />
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