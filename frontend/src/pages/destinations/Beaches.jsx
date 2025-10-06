import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './styles/Beaches.css';

const API_URL = 'http://localhost:5000/api/destinations';

const Beaches = () => {
  const [beaches, setBeaches] = useState([]);

  useEffect(() => {
    const fetchBeaches = async () => {
      try {
        const res = await axios.get(API_URL);
        const filtered = res.data.filter(dest => dest.category === 'Beaches');
        setBeaches(filtered);
      } catch (err) {
        console.error('Error fetching beaches:', err);
      }
    };

    fetchBeaches();
  }, []);

  return (
    <>
      <Navbar />

      <div className="beaches-hero">
        <div className="beaches-hero-overlay" />
        <div className="beaches-hero-content">
          <h1 className="beaches-title">BEACHES</h1>
          <div className="beaches-underline" />
          <p className="beaches-subtitle">Explore the most beautiful beaches in our municipalities.</p>
        </div>
      </div>

      <div className="beaches-section">
        <div className="beaches-grid">
          {beaches.length > 0 ? (
            beaches.map((beach) => (
              <div key={beach.id} className="beaches-card">
                <img
                  src={`http://localhost:5000${beach.image}`}
                  alt={beach.name}
                  className="beaches-img"
                />
                <div className="beaches-content">
                  <h3 className="beaches-name">{beach.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <p>No beach destinations found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Beaches;
