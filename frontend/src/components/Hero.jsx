import React, { useEffect, useState } from 'react';
import '../styles/components.css';

const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3003/api/hero')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch hero content');
        return res.json();
      })
      .then(data => {
        setHeroData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!heroData) return <div>Failed to load hero content.</div>;

  // Cache busting to avoid browser caching issues
const mediaUrl = heroData.media_path
  ? `http://localhost:3003/${heroData.media_path}`
  : 'https://via.placeholder.com/1920x1080?text=No+Media';



  return (
    <div className="hero-container">
      {heroData.media_type === 'video' ? (
        <video
          className="hero-background"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          key={mediaUrl}
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          className="hero-background-image"
          style={{ backgroundImage: `url(${mediaUrl})` }}
        />
      )}

      <div className="hero-overlay">
        <h1 className="hero-title">{heroData.title}</h1>
        <p className="hero-subtitle">{heroData.subtitle}</p>
      </div>
    </div>
  );
};

export default Hero;
