import { useState, useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import myLocationIcon from '../assets/icons/location.jpg';
import '../styles/pages.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const FlyToUser = ({ location, trigger, setTrigger }) => {
  const map = useMap();

  useEffect(() => {
    if (location && trigger) {
      map.flyTo(location, 15, { animate: true, duration: 1 });
      setTrigger(false);
    }
  }, [location, trigger, map, setTrigger]);

  return null;
};

const Routing = ({ origin, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!origin || !destination) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(origin[0], origin[1]), L.latLng(destination[0], destination[1])],
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(control);
  }, [origin, destination, map]);

  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const [isSatellite, setIsSatellite] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [routeTo, setRouteTo] = useState(null);
  const [flyToUser, setFlyToUser] = useState(false);
  const [touristSpots, setTouristSpots] = useState([]);

  const mapCenter = [12.5269, 121.4380];

  // Get user geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch tourist spots from backend
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await axios.get('http://localhost:3004/map/touristspots'); // Adjust base URL as needed
        setTouristSpots(res.data);
      } catch (error) {
        console.error('Failed to fetch tourist spots:', error);
      }
    };
    fetchSpots();
  }, []);

  return (
    <div className="map-page-container">
      <div className="map-controls">
        <button className="back-button-floating" onClick={() => navigate(-1)}>← Back</button>

        <div className="layer-toggle">
          <label className="layer-label">Map View:</label>
          <select
            onChange={() => setIsSatellite(!isSatellite)}
            value={isSatellite ? 'satellite' : 'street'}
          >
            <option value="satellite">Satellite</option>
            <option value="street">Street</option>
          </select>
        </div>

        {routeTo && (
          <button className="cancel-button" onClick={() => setRouteTo(null)}>
            Cancel Directions
          </button>
        )}
      </div>

      <div className="map-container">
        <MapContainer center={mapCenter} zoom={11} zoomControl={false} className="leaflet-map">
          <ZoomControl position="bottomright" />

          {flyToUser && userLocation && (
            <FlyToUser location={userLocation} trigger={flyToUser} setTrigger={setFlyToUser} />
          )}

          {routeTo && userLocation && (
            <Routing origin={userLocation} destination={routeTo} />
          )}

          <TileLayer
            url={
              isSatellite
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution={
              isSatellite
                ? 'Tiles © Esri — Sources: Esri, USGS, NOAA'
                : '&copy; OpenStreetMap contributors'
            }
          />

          {touristSpots.map((spot, i) => (
            <Marker
              key={i}
              position={[spot.lat, spot.lng]}
              icon={L.icon({
                iconUrl: `/uploads/touristspotsmap/${spot.image}`,
                iconSize: [30, 30],
                className: 'custom-circle-icon',
              })}
            >
              <Popup>
                {spot.name}
                <br />
                <button onClick={() => setRouteTo([spot.lat, spot.lng])}>Get Directions</button>
              </Popup>
            </Marker>
          ))}

          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'custom-location-icon',
                html: '<div class="marker-pin"></div><i class="fa fa-map-marker"></i>',
                iconSize: [30, 42],
                iconAnchor: [15, 42],
              })}
            >
              <Popup>You are here!</Popup>
            </Marker>
          )}
        </MapContainer>

        {userLocation && (
          <button
            className="my-location-icon-button"
            onClick={() => setFlyToUser(true)}
            title="Show My Location"
          >
            <img src={myLocationIcon} alt="My Location" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapPage;
