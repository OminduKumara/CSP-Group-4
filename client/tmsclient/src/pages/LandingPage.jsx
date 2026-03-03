import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingPage.css';

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
        
        {/* 1. Practice Times Section */}
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

        {/* 2. Team Captains Section */}
        <section className="section-container">
          <h2 className="section-title">Current Leadership</h2>
          <div className="leadership-row">
            <div>
              <h3 className="team-heading">Men's Team</h3>
              <p><strong>Captain:</strong> Heshan Ranwala</p>
              <p><strong>Vice Captain:</strong> Thisura Lonath</p>
            </div>
            <div>
              <h3 className="team-heading">Women's Team</h3>
              <p><strong>Captain:</strong> Chalani Bandara</p>
              <p><strong>Vice Captain:</strong> Yalindi Dalpathadu</p>
            </div>
          </div>
        </section>

        {/* 3. Contact Details Section */}
        <section className="section-container contact-section">
          <h2 className="section-title">Get in Touch</h2>
          <div className="contact-details">
            <p><strong>Men's Team Inquiries:</strong> 📞 +94 77 891 5969 | ✉️ heshan.r@sliit.lk</p>
            <p><strong>Women's Team Inquiries:</strong> 📞 +94 74 195 5313 | ✉️ chalani.b@sliit.lk</p>
          </div>
        </section>

        {/* 4. Past Captains Section */}
        <section className="section-container">
          <h2 className="section-title">Past Captains</h2>
          <div className="legacy-list">
            <p><strong>2025:</strong> Hasal Salwathura (Men) | Heshika Naranwala (Women)</p>
            <p><strong>2024:</strong> Nithila Allalgoda (Men) | Ravindie Tilakaratne (Women)</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;