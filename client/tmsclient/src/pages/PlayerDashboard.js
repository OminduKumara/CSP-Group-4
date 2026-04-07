import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, User, Package, Activity } from 'lucide-react';
import { playerService } from '../services/playerService'; // Import the new service
import '../styles/AdminDashboard.css';

function isAdminRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
}

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const username = auth.user?.username || 'Player';
  const role = auth.user?.role;
  const isAdmin = isAdminRole(role);

  // Real state for our data
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    sessionsAttended: 0,
    sessionsMissed: 0,
    activeInventoryItems: 0,
    nextPractice: "Loading..."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    // Fetch the real data from the backend!
    const fetchStats = async () => {
      try {
        const response = await playerService.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, navigate]);

  if (isAdmin) return null;

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const attendanceData = [
    { name: 'Attended', value: stats.sessionsAttended, color: '#10b981' },
    { name: 'Missed', value: stats.sessionsMissed, color: '#ef4444' }
  ];

  if (loading) {
      return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>Tennis Management System</h1>
          <div className="nav-right">
            <span className="welcome-text">Welcome, {username}!</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="admin-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#111827' }}>My Dashboard</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
              <Activity size={20} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Attendance Rate</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: stats.attendancePercentage >= 50 ? '#10b981' : '#ef4444' }}>
              {stats.attendancePercentage}%
            </p>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
              <Calendar size={20} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Next Practice</h3>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#111827', marginTop: '10px' }}>
              {stats.nextPractice}
            </p>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
              <Package size={20} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Active Equipment</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#3b82f6' }}>
              {stats.activeInventoryItems} Items
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#374151' }}>Attendance Breakdown</h3>
            <div style={{ height: '250px', width: '100%' }}>
              {(stats.sessionsAttended > 0 || stats.sessionsMissed > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No attendance data recorded yet.
                </div>
              )}
            </div>
            {(stats.sessionsAttended > 0 || stats.sessionsMissed > 0) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div> Attended</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div> Missed</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, color: '#374151' }}>Quick Actions</h3>
            
            <button onClick={() => navigate('/my-attendance')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '12px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px' }}><Calendar size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>Practice Sessions</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>View your detailed attendance records</p>
              </div>
            </button>

            <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '12px', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px' }}><User size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>Personal Profile</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Update your contact info and details</p>
              </div>
            </button>

            <button onClick={() => navigate('/inventory')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '12px', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '8px' }}><Package size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>Equipment Inventory</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Request and view your borrowed gear</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}