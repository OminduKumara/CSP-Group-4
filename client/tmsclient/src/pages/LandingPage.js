import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingPage.css';

const LandingPage = () => {
  // 1. Set up state to hold the dynamic data from your backend
  const [practiceSchedule, setPracticeSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch the data as soon as the page loads
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('http://localhost:5011/api/practicesessions');
        
        if (!response.ok) {
          throw new Error("Database blocked or backend unavailable");
        }
        
        // ASP.NET automatically converts C# PascalCase properties to camelCase in JSON
        const data = await response.json();
        setPracticeSchedule(data);
      } catch (err) {
        console.warn("Using fallback data. Real database is currently unreachable.", err);
        
        // FALLBACK DATA: Keeps the UI working until the Azure IP whitelist is fixed
        setPracticeSchedule([
          { dayOfWeek: 'Wednesday', startTime: '3:00 PM', endTime: '6:30 PM', sessionType: 'Team Practice (Fallback)' },
          { dayOfWeek: 'Friday', startTime: '3:00 PM', endTime: '5:30 PM', sessionType: 'Beginners Practice (Fallback)' },
          { dayOfWeek: 'Saturday', startTime: '8:30 AM', endTime: '11:30 AM', sessionType: 'Team Practice (Fallback)' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="landing-container">
      <Navbar />
      
      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">Welcome to SLIIT Tennis</h1>
        <p className="hero-subtitle">Track performance, manage tournaments, and stay updated.</p>
      </header>

      <main className="main-content">
        
        {/* 1. Practice Times Section (Now Dynamic) */}
        <section className="section-container">
          <h2 className="section-title">Weekly Practice Times</h2>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#4a5568' }}>Loading schedule from server...</p>
          ) : (
            <div className="grid">
              {/* Notice the variables map perfectly to your C# PracticeSession properties */}
              {practiceSchedule.map((practice, index) => (
                <div key={index} className="practice-card">
                  <h3 className="card-title">{practice.dayOfWeek}</h3>
                  <p><strong>Time:</strong> {practice.startTime} - {practice.endTime}</p>
                  <p><strong>Session:</strong> {practice.sessionType}</p>
                </div>
              ))}
            </div>
          )}
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