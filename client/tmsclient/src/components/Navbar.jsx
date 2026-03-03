import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <h2>SLIIT Tennis</h2>
      </div>
      <div>
        {/* Navigates to the login page */}
        <Link to="/login" style={styles.loginBtn}>Login</Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#002147', // SLIIT Blue
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: { margin: 0 },
  loginBtn: {
    backgroundColor: '#f39c12',
    color: 'white',
    padding: '0.5rem 1.2rem',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  }
};

export default Navbar;