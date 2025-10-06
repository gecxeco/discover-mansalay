import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './styles/Restaurants.css';

const API_URL = 'http://localhost:5000/api/destinations';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(API_URL);
        const filtered = res.data.filter(dest => dest.category === 'Restaurants');
        setRestaurants(filtered);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <>
      <Navbar />

      <div className="restaurants-hero">
        <div className="restaurants-hero-overlay" />
        <div className="restaurants-hero-content">
          <h1 className="restaurants-title">RESTAURANTS</h1>
          <div className="restaurants-underline" />
          <p className="restaurants-subtitle">
            Discover top dining experiences in our municipalities.
          </p>
        </div>
      </div>

      <div className="restaurants-section">
        <div className="restaurants-grid">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurants-card">
                <img
                  src={`http://localhost:5000${restaurant.image}`}
                  alt={restaurant.name}
                  className="restaurants-img"
                />
                <div className="restaurants-content">
                  <h3 className="restaurants-name">{restaurant.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <p>No restaurant destinations found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Restaurants;
