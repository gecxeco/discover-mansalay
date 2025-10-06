import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './styles/NavbarPages.css';

const Accommodations = () => {
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/destinations');
        const filtered = res.data.filter(
          (item) => item.category === 'Accommodations'
        );
        setAccommodations(filtered);
      } catch (err) {
        console.error('Failed to fetch accommodations', err);
      }
    };

    fetchAccommodations();
  }, []);

  return (
    <>
      <Navbar />
      <div className="navbar-hero accommodations-hero">
        <div className="navbar-hero-overlay" />
        <div className="navbar-hero-content">
          <h1 className="navbar-hero-title">ACCOMMODATIONS</h1>
          <div className="navbar-hero-underline" />
          <p className="navbar-hero-subtitle">Find a place to stay for every traveler.</p>
        </div>
      </div>

      <div className="navbar-section">
        <h2 className="navbar-section-title">Top Places to Stay</h2>
        <div className="navbar-grid">
          {accommodations.length > 0 ? (
            accommodations.map((place) => (
              <div key={place.id} className="navbar-card">
                <img
                  src={`http://localhost:5000${place.image}`}
                  alt={place.name}
                  className="navbar-card-image"
                />
                <h3 className="navbar-card-title">{place.name}</h3>
                <p className="navbar-card-text">{place.description}</p>
              </div>
            ))
          ) : (
            <p>No accommodations available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Accommodations;
