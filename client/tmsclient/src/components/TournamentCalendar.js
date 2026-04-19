import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { tournamentService } from '../services/tournamentService';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/TournamentCalendar.css';

const localizer = momentLocalizer(moment);

export default function TournamentCalendar({ token, refreshTrigger }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    loadTournaments();
  }, [refreshTrigger]);

  async function loadTournaments() {
    try {
      setLoading(true);
      setError('');
      
      const tournaments = await tournamentService.getAllTournaments();
      
      const calendarEvents = tournaments.map(tournament => ({
        id: `tournament-${tournament.id}`,
        title: tournament.name,
        start: new Date(tournament.startDate),
        end: new Date(tournament.endDate),
        resource: {
          description: tournament.description,
          status: tournament.status,
          type: 'tournament',
          tournament: tournament
        }
      }));
      
      setEvents(calendarEvents);
    } catch (err) {
      setError('Failed to load tournaments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectEvent(event) {
    setSelectedEvent(event);
  }

  function getStatusColor(status) {
    const colors = {
      'Scheduled': '#38bdf8',
      'InProgress': '#FF5C00',
      'Completed': '#22c55e',
      'Cancelled': '#f43f5e',
      'Practice': '#8b5cf6'
    };
    return colors[status] || '#64748b';
  }

  const eventStyleGetter = (event) => {
    const backgroundColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '11px',
        fontWeight: '700'
      }
    };
  };

  return (
    <div className="tournament-calendar">
      <div className="calendar-header">
        <h2>Tournament Schedule</h2>
        <button onClick={loadTournaments} className="btn-refresh" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="calendar-container">
        {loading && events.length === 0 ? (
          <div className="loading">Synchronizing Calendar...</div>
        ) : (
          <>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              style={{ height: 600 }}
              popup
              selectable
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
            />
            
            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#38bdf8' }}></div>
                <span>Scheduled</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FF5C00' }}></div>
                <span>Active</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f43f5e' }}></div>
                <span>Cancelled</span>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedEvent && (
        <div className="event-details-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
            
            <div className="event-details-header">
              <h3>{selectedEvent.title}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedEvent.resource.status) }}
              >
                {selectedEvent.resource.status}
              </span>
            </div>

            <div className="event-detail-item">
              <strong>Category & Type:</strong>
              <p>{selectedEvent.resource.type === 'tournament' ? 'Official Tournament' : `Practice (${selectedEvent.resource.session?.sessionType || 'Session'})`}</p>
            </div>

            {selectedEvent.resource.description && (
              <div className="event-detail-item">
                <strong>Details:</strong>
                <p>{selectedEvent.resource.description}</p>
              </div>
            )}

            <div className="event-detail-item">
              <strong>Start:</strong>
              <p>{moment(selectedEvent.start).format('MMMM D, YYYY HH:mm')}</p>
            </div>

            <div className="event-detail-item">
              <strong>End:</strong>
              <p>{moment(selectedEvent.end).format('MMMM D, YYYY HH:mm')}</p>
            </div>

            {selectedEvent.resource.type === 'session' && selectedEvent.resource.session && (
              <div className="event-detail-item">
                <strong>Recurring Day:</strong>
                <p>{selectedEvent.resource.session.dayOfWeek}</p>
              </div>
            )}

            <button className="btn-close" onClick={() => setSelectedEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
