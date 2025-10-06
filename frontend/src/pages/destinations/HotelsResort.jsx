import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './styles/HotelsResort.css';

const API_URL = 'http://localhost:5000/api/destinations';

const HotelsResort = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get(API_URL);
        const filtered = res.data.filter(dest => dest.category === 'Hotels & Resort');
        setHotels(filtered);
      } catch (err) {
        console.error('Error fetching hotels & resorts:', err);
      }
    };

    fetchHotels();
  }, []);

  return (
    <>
      <Navbar />

      <div className="hotels-hero">
        <div className="hotels-hero-overlay" />
        <div className="hotels-hero-content">
          <h1 className="hotels-title">HOTELS & RESORTS</h1>
          <div className="hotels-underline" />
          <p className="hotels-subtitle">Comfort and luxury await at our top-rated stays.</p>
        </div>
      </div>

      <div className="hotels-section">
        <div className="hotels-grid">
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div key={hotel.id} className="hotels-card">
                <img
                  src={`http://localhost:5000${hotel.image}`}
                  alt={hotel.name}
                  className="hotels-img"
                />
                <div className="hotels-content">
                  <h3 className="hotels-name">{hotel.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <p>No hotel or resort listings available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default HotelsResort;
