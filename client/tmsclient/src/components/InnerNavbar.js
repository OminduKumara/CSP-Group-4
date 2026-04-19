import React from 'react';
import { useNavigate } from 'react-router-dom';
import sliitLogo from '../assets/SLIIT-3.png';
import tennisLogo from '../assets/tennis-logo.png';

/**
 * Branded top bar for inner (authenticated) pages.
 * Shows both logos, a page title, optional welcome text, and back + logout buttons.
 */
export default function InnerNavbar({ title, username, onLogout, backTo = '/dashboard' }) {
  const navigate = useNavigate();

  const handleConfirmedLogout = () => {
    const shouldLogout = window.confirm('Are you sure you want to log out?');
    if (!shouldLogout) return;
    onLogout?.();
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.7rem 2.5rem', backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10,
      fontFamily: "'Montserrat', sans-serif"
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src={sliitLogo} alt="SLIIT" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ width: '1.5px', height: '32px', background: '#d1d5db' }} />
        <img src={tennisLogo} alt="Tennis Club" style={{ height: '44px', width: 'auto', borderRadius: '50%' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#000040', lineHeight: 1.2 }}>SLIIT Tennis</span>
          {title && <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#FF5C00', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{title}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {username && (
          <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>
            Welcome, <strong style={{ color: '#000040' }}>{username}</strong>
          </span>
        )}
        <button onClick={() => navigate(backTo)} style={{
          background: 'transparent', color: '#000040', border: '1.5px solid #d1d5db', borderRadius: '50px',
          padding: '0.45rem 1.2rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s', letterSpacing: '0.3px'
        }}
        onMouseEnter={e => { e.target.style.borderColor = '#000040'; e.target.style.background = '#f0f1f5'; }}
        onMouseLeave={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.background = 'transparent'; }}
        >
          <span style={{ marginRight: '4px' }}>←</span> Back
        </button>
        {onLogout && (
          <button onClick={handleConfirmedLogout} style={{
            background: '#FF5C00', color: '#fff', border: 'none', borderRadius: '50px',
            padding: '0.45rem 1.2rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: "'Montserrat', sans-serif", boxShadow: '0 2px 10px rgba(255,92,0,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '0.3px'
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 18px rgba(255,92,0,0.4)'; }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 10px rgba(255,92,0,0.25)'; }}
          >Logout</button>
        )}
      </div>
    </nav>
  );
}
