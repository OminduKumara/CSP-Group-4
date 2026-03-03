import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingPage.css'; // Importing the new external stylesheet

const LandingPage = () => {
  const practiceSchedule = [
    { day: 'Wednesday', time: '3:00 PM - 6:30 PM', session: 'Team Practice' },
    { day: 'Friday', time: '3:00 PM - 5:30 PM', session: 'Beginners Practice' },
    { day: 'Saturday', time: '8:30 AM - 11:30 AM', session: 'Team Practice' },
  ];

  return (
    <div className="landing-container">
      <Navbar />
      
      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">Welcome to SLIIT Tennis</h1>
        <p className="hero-subtitle">Track performance, manage tournaments, and stay updated.</p>
      </header>

      <main className="main-content">
        {/* Practice Times Section */}
        <section className="section-container">
          <h2 className="section-title">Weekly Practice Times</h2>
          <div className="grid">
            {practiceSchedule.map((practice, index) => (
              <div key={index} className="practice-card">
                <h3 className="card-title">{practice.day}</h3>
                <p><strong>Time:</strong> {practice.time}</p>
                <p><strong>Session:</strong> {practice.session}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Leadership Section */}
        <section className="section-container">
          <h2 className="section-title">Team Leadership</h2>
          <div className="grid">
            {/* Men's Team Card */}
            <div className="leadership-card">
              <h3 className="card-title">Men's Team</h3>
              <p><strong>Captain:</strong> Heshan Ranwala</p>
              <p className="contact-text">📞 +94 77 123 4567</p>
              <p className="contact-text">✉️ heshan.r@sliit.lk</p>
              <br />
              <p><strong>Vice Captain:</strong> Thisura Lonath</p>
            </div>

            {/* Women's Team Card */}
            <div className="leadership-card">
              <h3 className="card-title">Women's Team</h3>
              <p><strong>Captain:</strong> Chalani Bandara</p>
              <p className="contact-text">📞 +94 77 987 6543</p>
              <p className="contact-text">✉️ chalani.b@sliit.lk</p>
              <br />
              <p><strong>Vice Captain:</strong> Yalindi Dalpathadu</p>
            </div>
          </div>
        </section>
      </main>
      <Footer /> {/* Add the footer here */}
    </div>
  );
};

export default LandingPage;