import React, { useEffect, useState } from 'react';
import '../styles/components.css';

const Experience = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3003/api/experiencecms')
      .then(res => res.json())
      .then(data => {
        console.log('Experience cards:', data);
        setCards(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading experience cards:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading experience cards...</p>;

  if (cards.length < 6) {
    return <p>Not enough experience cards to display. Currently have {cards.length}.</p>;
  }

  return (
    <section className="experience-container">
      <h2 className="experience-title">Experience Mansalay</h2>
      <div className="experience-grid">

        {/* Left side */}
        <div className="left-side">
          {/* Large card */}
          <a
            href={cards[0].link}
            target="_blank"
            rel="noopener noreferrer"
            className="large-card"
          >
            <img
              src={`http://localhost:3003/uploads/${cards[0].image_path}`}
              alt={cards[0].title}
              loading="lazy"
            />
            <div className="card-label">{cards[0].title}</div>
          </a>

          {/* Two small cards */}
          <div className="small-cards-row">
            {[1, 2].map(i => (
              <a
                key={cards[i].id}
                href={cards[i].link}
                target="_blank"
                rel="noopener noreferrer"
                className="small-card"
              >
                <img
                  src={`http://localhost:3003/uploads/${cards[i].image_path}`}
                  alt={cards[i].title}
                  loading="lazy"
                />
                <div className="card-label">{cards[i].title}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="right-side">
          {/* Two small cards */}
          <div className="small-cards-row">
            {[3, 5].map(i => (
              <a
                key={cards[i].id}
                href={cards[i].link}
                target="_blank"
                rel="noopener noreferrer"
                className="small-card"
              >
                <img
                  src={`http://localhost:3003/uploads/${cards[i].image_path}`}
                  alt={cards[i].title}
                  loading="lazy"
                />
                <div className="card-label">{cards[i].title}</div>
              </a>
            ))}
          </div>

          {/* Large card */}
          <a
            href={cards[4].link}
            target="_blank"
            rel="noopener noreferrer"
            className="large-card"
          >
            <img
              src={`http://localhost:3003/uploads/${cards[4].image_path}`}
              alt={cards[4].title}
              loading="lazy"
            />
            <div className="card-label">{cards[4].title}</div>
          </a>
        </div>

      </div>
    </section>
  );
};

export default Experience;
