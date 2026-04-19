import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-copyright">
          <p>© 2025 SLIIT Tennis Management System. All rights reserved.</p>
          <p>Developed by CSP Group 04</p>
        </div>
        <div className="footer-links">
          <a href="#hero">Home</a>
          <a href="#schedule">Schedule</a>
          <a href="#leadership">Leadership</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;