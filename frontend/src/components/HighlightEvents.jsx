import React, { useEffect, useRef, useState } from 'react';
import '../styles/components.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { format } from 'date-fns';
import axios from 'axios';

const HighlightEvents = () => {
  const swiperRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3003/api/highlightcms/highlight-events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  if (events.length === 0) return <p>Loading highlight events...</p>;

  const currentEvent = events[activeIndex];

  // Safely parse date range
  let formattedDateRange = '';
  if (currentEvent?.date_range) {
    const dates = currentEvent.date_range.split(' - ');
    if (dates.length === 2) {
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[1]);
      // Check if dates are valid
      if (!isNaN(startDate) && !isNaN(endDate)) {
        formattedDateRange = `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`;
      }
    }
  }

  return (
    <section className="highlight-container">
      <div className="highlight-text">
        <h2>Highlight Events</h2>
        <p className="highlight-title">{currentEvent?.title}</p>
        <p>{currentEvent?.description}</p>
        <p className="date-range">{formattedDateRange}</p>
        <a href={currentEvent?.link} className="view-more" target="_blank" rel="noopener noreferrer">
          View More
        </a>
      </div>

      <div className="highlight-carousel">
        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={2.7}
          speed={700}
          slideToClickedSlide={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 50,
            modifier: 2,
            slideShadows: false,
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="highlight-swiper"
        >
          {events.map((event, index) => (
            <SwiperSlide key={index}>
              <img src={`http://localhost:3003/uploads/highlightevents/${event.image_url}`} alt={event.title} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="arrow" onClick={() => swiperRef.current?.slideNext()}>
          &gt;
        </div>
      </div>
    </section>
  );
};

export default HighlightEvents;
