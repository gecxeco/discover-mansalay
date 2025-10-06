import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './styles/Adventures.css';

const API_URL = 'http://localhost:5000/api/destinations';

const Adventures = () => {
  const [adventures, setAdventures] = useState([]);

  useEffect(() => {
    const fetchAdventures = async () => {
      try {
        const res = await axios.get(API_URL);
        const filtered = res.data.filter(dest => dest.category === 'Adventures');
        setAdventures(filtered);
      } catch (err) {
        console.error('Error fetching adventures:', err);
      }
    };

    fetchAdventures();
  }, []);

  return (
    <>
      <Navbar />

      <div className="adventures-hero">
        <div className="adventures-hero-overlay" />
        <div className="adventures-hero-content">
          <h1 className="adventures-title">ADVENTURES</h1>
          <div className="adventures-underline" />
          <p className="adventures-subtitle">
            Thrilling adventures for every adrenaline seeker.
          </p>
        </div>
      </div>

      <div className="adventures-section">
        <div className="adventures-grid">
          {adventures.length > 0 ? (
            adventures.map((adventure) => (
              <div key={adventure.id} className="adventures-card">
                <img
                  src={`http://localhost:5000${adventure.image}`}
                  alt={adventure.name}
                  className="adventures-img"
                />
                <div className="adventures-content">
                  <h3 className="adventures-name">{adventure.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <p>No adventure destinations found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Adventures;
