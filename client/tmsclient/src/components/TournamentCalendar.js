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
        id: tournament.id,
        title: tournament.name,
        start: new Date(tournament.startDate),
        end: new Date(tournament.endDate),
        resource: {
          description: tournament.description,
          status: tournament.status,
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
      'Scheduled': '#007bff',
      'InProgress': '#ffc107',
      'Completed': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  const eventStyleGetter = (event) => {
    const backgroundColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="tournament-calendar">
      <div className="calendar-header">
        <h2>Tournament Calendar</h2>
        <button onClick={loadTournaments} className="btn-refresh" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="calendar-container">
        {loading && events.length === 0 ? (
          <div className="loading">Loading calendar...</div>
        ) : (
          <>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              style={{ height: 500 }}
              popup
              selectable
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
            />
            
            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#007bff' }}></div>
                <span>Scheduled</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
                <span>In Progress</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
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

            {selectedEvent.resource.description && (
              <div className="event-detail-item">
                <strong>Description:</strong>
                <p>{selectedEvent.resource.description}</p>
              </div>
            )}

            <div className="event-detail-item">
              <strong>Start Date:</strong>
              <p>{moment(selectedEvent.start).format('MMMM D, YYYY HH:mm')}</p>
            </div>

            <div className="event-detail-item">
              <strong>End Date:</strong>
              <p>{moment(selectedEvent.end).format('MMMM D, YYYY HH:mm')}</p>
            </div>

            <div className="event-detail-item">
              <strong>Duration:</strong>
              <p>{moment(selectedEvent.end).diff(moment(selectedEvent.start), 'days')} days</p>
            </div>

            <button className="btn-close" onClick={() => setSelectedEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
