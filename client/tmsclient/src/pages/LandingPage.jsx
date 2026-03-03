import React from 'react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  // Hardcoded practice schedule to satisfy the Visitor requirement
  const practiceSchedule = [
    { day: 'Monday', time: '4:00 PM - 6:00 PM', session: 'Beginners Practice' },
    { day: 'Wednesday', time: '5:00 PM - 7:00 PM', session: 'Intermediate / Advanced' },
    { day: 'Friday', time: '3:30 PM - 6:30 PM', session: 'Open Court & Drills' },
    { day: 'Saturday', time: '8:00 AM - 11:00 AM', session: 'Tournament Squad' },
  ];

  return (
    <div style={styles.container}>
      <Navbar />
      
      {/* Hero Section */}
      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to SLIIT Tennis</h1>
        <p style={styles.heroSubtitle}>Track performance, manage tournaments, and stay updated.</p>
      </header>

      {/* Practice Times Section */}
      <main style={styles.mainContent}>
        <section style={styles.scheduleSection}>
          <h2 style={styles.sectionTitle}>Weekly Practice Times</h2>
          <div style={styles.grid}>
            {practiceSchedule.map((practice, index) => (
              <div key={index} style={styles.card}>
                <h3 style={styles.cardDay}>{practice.day}</h3>
                <p><strong>Time:</strong> {practice.time}</p>
                <p><strong>Session:</strong> {practice.session}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' },
  hero: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#e2e8f0' },
  heroTitle: { fontSize: '2.5rem', color: '#002147', marginBottom: '1rem' },
  heroSubtitle: { fontSize: '1.2rem', color: '#4a5568' },
  mainContent: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  scheduleSection: { marginTop: '2rem' },
  sectionTitle: { textAlign: 'center', color: '#002147', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '4px solid #f39c12' },
  cardDay: { color: '#002147', marginTop: 0 }
};

export default LandingPage;