import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import './styles/NavbarPages.css';
import axios from 'axios';
import { format } from 'date-fns';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:3003/api/highlightcms/highlight-events');
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch events', err);
      }
    };
    fetchEvents();
  }, []);

  const formatDateRange = (rangeStr) => {
    if (!rangeStr) return '';
    const [startStr, endStr] = rangeStr.split(' - ');
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start) || isNaN(end)) return rangeStr;
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;
  };

  return (
    <>
      <Navbar />
      <div className="navbar-hero events-hero">
        <div className="navbar-hero-overlay" />
        <div className="navbar-hero-content">
          <h1 className="navbar-hero-title">EVENTS</h1>
          <div className="navbar-hero-underline" />
          <p className="navbar-hero-subtitle">Stay up to date on local happenings and festivals.</p>
        </div>
      </div>

      <div className="navbar-section">
        <h2 className="navbar-section-title">Upcoming Highlights</h2>
        <div className="navbar-grid">
          {events.length === 0 ? (
            <p>Loading events...</p>
          ) : (
            events.map((event, index) => (
              <div className="navbar-card" key={index}>
                <img
                  className="navbar-card-image"
                  src={`http://localhost:3003/uploads/highlightevents/${event.image_url}`}
                  alt={event.title}
                />
                <h3 className="navbar-card-title">{event.title}</h3>
                <p className="navbar-card-text">{event.description}</p>
                <p className="navbar-card-date">{formatDateRange(event.date_range)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Events;
