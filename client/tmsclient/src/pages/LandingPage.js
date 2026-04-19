import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingPage.css';

/* ── tiny hook: runs callback once when element scrolls into view ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* reusable wrapper component */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const LandingPage = () => {
  const [practiceSchedule, setPracticeSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/practicesessions`);
        if (!response.ok) throw new Error("Database blocked or backend unavailable");
        const data = await response.json();
        setPracticeSchedule(data);
      } catch (err) {
        console.warn("Using fallback data. Real database is currently unreachable.", err);
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

  /* ---- Professional SVG Icons ---- */
  const CalendarIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--lp-orange, #FF5C00)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lp-navy, #000080)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--lp-navy, #000080)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--lp-navy, #000080)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  return (
    <div className="landing-container">
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <header className="lp-hero" id="hero">
        <div className="lp-hero__overlay" />
        <div className="lp-hero__content">
          <h1 className="lp-hero__title">
            <span className="lp-hero__animated-text">SLIIT Tennis</span>
          </h1>
          <p className="lp-hero__tagline">Elevate Your <span className="lp-hero__accent">Game</span></p>
          <p className="lp-hero__subtitle">
            Track performance, manage tournaments, and stay updated — all in one place.
          </p>
          <a href="#schedule" className="lp-hero__cta">View Practice Schedule</a>
        </div>

        {/* floating stats bar */}
        <div className="lp-stats-bar">
          <div className="lp-stat">
            <span className="lp-stat__number">3</span>
            <span className="lp-stat__label">Weekly Sessions</span>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat">
            <span className="lp-stat__number">2</span>
            <span className="lp-stat__label">Competitive Teams</span>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat">
            <span className="lp-stat__number">50+</span>
            <span className="lp-stat__label">Active Members</span>
          </div>
        </div>
      </header>

      <main className="lp-main">

        {/* ═══════════ PRACTICE SCHEDULE ═══════════ */}
        <section className="lp-section" id="schedule">
          <Reveal>
            <div className="lp-section__header">
              <span className="lp-section__tag">Schedule</span>
              <h2 className="lp-section__title">Weekly Practice Times</h2>
              <p className="lp-section__desc">Join us on the court — sessions for every skill level.</p>
            </div>
          </Reveal>

          {loading ? (
            <div className="lp-loader">
              <div className="lp-loader__spinner" />
              <p>Loading schedule from server…</p>
            </div>
          ) : (
            <div className="lp-cards-grid">
              {practiceSchedule.map((practice, index) => (
                <Reveal key={index} delay={index * 120}>
                  <div className="lp-practice-card">
                    <div className="lp-practice-card__icon">
                      <CalendarIcon />
                    </div>
                    <h3 className="lp-practice-card__day">{practice.dayOfWeek}</h3>
                    <div className="lp-practice-card__time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {practice.startTime} – {practice.endTime}
                    </div>
                    <span className="lp-practice-card__type">{practice.sessionType}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════ LEADERSHIP ═══════════ */}
        <section className="lp-section lp-section--alt" id="leadership">
          <Reveal>
            <div className="lp-section__header">
              <span className="lp-section__tag">Leadership</span>
              <h2 className="lp-section__title">Current Leadership</h2>
              <p className="lp-section__desc">Meet the captains guiding our team to success.</p>
            </div>
          </Reveal>

          <div className="lp-leadership-grid">
            <Reveal delay={0}>
              <div className="lp-leader-card">
                <div className="lp-leader-card__badge"><UsersIcon /></div>
                <h3 className="lp-leader-card__team">Men's Team</h3>
                <div className="lp-leader-card__row">
                  <span className="lp-leader-card__role">Captain</span>
                  <span className="lp-leader-card__name">Heshan Ranwala</span>
                </div>
                <div className="lp-leader-card__row">
                  <span className="lp-leader-card__role">Vice Captain</span>
                  <span className="lp-leader-card__name">Thisura Lonath</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="lp-leader-card">
                <div className="lp-leader-card__badge"><UsersIcon /></div>
                <h3 className="lp-leader-card__team">Women's Team</h3>
                <div className="lp-leader-card__row">
                  <span className="lp-leader-card__role">Captain</span>
                  <span className="lp-leader-card__name">Chalani Bandara</span>
                </div>
                <div className="lp-leader-card__row">
                  <span className="lp-leader-card__role">Vice Captain</span>
                  <span className="lp-leader-card__name">Yalindi Dalpathadu</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════ CONTACT ═══════════ */}
        <section className="lp-section" id="contact">
          <Reveal>
            <div className="lp-section__header">
              <span className="lp-section__tag">Contact</span>
              <h2 className="lp-section__title">Get in Touch</h2>
              <p className="lp-section__desc">Reach out to our team captains for inquiries.</p>
            </div>
          </Reveal>

          <div className="lp-contact-grid">
            <Reveal delay={0}>
              <div className="lp-contact-card">
                <h4 className="lp-contact-card__label">Men's Team Inquiries</h4>
                <div className="lp-contact-card__item">
                  <span className="lp-contact-card__icon"><PhoneIcon /></span>
                  <span>+94 77 891 5969</span>
                </div>
                <div className="lp-contact-card__item">
                  <span className="lp-contact-card__icon"><MailIcon /></span>
                  <span>heshan.r@sliit.lk</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="lp-contact-card">
                <h4 className="lp-contact-card__label">Women's Team Inquiries</h4>
                <div className="lp-contact-card__item">
                  <span className="lp-contact-card__icon"><PhoneIcon /></span>
                  <span>+94 74 195 5313</span>
                </div>
                <div className="lp-contact-card__item">
                  <span className="lp-contact-card__icon"><MailIcon /></span>
                  <span>chalani.b@sliit.lk</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════ PAST CAPTAINS ═══════════ */}
        <section className="lp-section lp-section--alt" id="legacy">
          <Reveal>
            <div className="lp-section__header">
              <span className="lp-section__tag">Legacy</span>
              <h2 className="lp-section__title">Past Captains</h2>
              <p className="lp-section__desc">Honoring those who led our teams to glory.</p>
            </div>
          </Reveal>

          <div className="lp-timeline">
            <Reveal delay={0}>
              <div className="lp-timeline__item">
                <div className="lp-timeline__year">2025</div>
                <div className="lp-timeline__content">
                  <div className="lp-timeline__row">
                    <span className="lp-timeline__team">Men's</span>
                    <span className="lp-timeline__name">Hasal Salwathura</span>
                  </div>
                  <div className="lp-timeline__row">
                    <span className="lp-timeline__team">Women's</span>
                    <span className="lp-timeline__name">Heshika Naranwala</span>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="lp-timeline__item">
                <div className="lp-timeline__year">2024</div>
                <div className="lp-timeline__content">
                  <div className="lp-timeline__row">
                    <span className="lp-timeline__team">Men's</span>
                    <span className="lp-timeline__name">Nithila Allalgoda</span>
                  </div>
                  <div className="lp-timeline__row">
                    <span className="lp-timeline__team">Women's</span>
                    <span className="lp-timeline__name">Ravindie Tilakaratne</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;