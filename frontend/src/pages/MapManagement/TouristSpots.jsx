import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TouristSpots = () => {
  const [spots, setSpots] = useState([]);
  const [editingSpot, setEditingSpot] = useState(null);
  const [adding, setAdding] = useState(false);

  const fetchSpots = async () => {
    try {
      const res = await api.get('/map/touristspots');
      setSpots(res.data);
    } catch (err) {
      console.error('Failed to fetch spots', err);
      toast.error('Failed to fetch tourist spots');
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleAdd = async (formData) => {
    try {
      await api.post('/map/touristspots', formData);
      toast.success('Spot added successfully!');
      setAdding(false);
      fetchSpots();
    } catch (err) {
      toast.error('Failed to add spot. Check console.');
      console.error(err);
    }
  };

  const handleEdit = async (formData) => {
    try {
      await api.put(`/map/touristspots/${editingSpot.id}`, formData);
      toast.success('Spot updated successfully!');
      setEditingSpot(null);
      fetchSpots();
    } catch (err) {
      toast.error('Failed to update spot. Check console.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this spot?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/map/touristspots/${id}`);
      toast.success('Spot deleted');
      fetchSpots();
    } catch (err) {
      toast.error('Failed to delete spot');
      console.error(err);
    }
  };

  const TouristSpotForm = ({ onSubmit, initialData = {}, onCancel }) => {
    const [name, setName] = useState(initialData.name || '');
    const [lat, setLat] = useState(initialData.lat || '');
    const [lng, setLng] = useState(initialData.lng || '');
    const [category, setCategory] = useState(initialData.category || '');
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('name', name);
      formData.append('lat', parseFloat(lat));
      formData.append('lng', parseFloat(lng));
      formData.append('category', category);
      if (image) formData.append('image', image);
      await onSubmit(formData);
    };

    return (
      <div className="touristspot-modal-overlay">
        <div className="touristspot-modal">
          <h3 className="touristspot-form-title">{initialData.id ? 'Edit' : 'Add'} Tourist Spot</h3>
          <form onSubmit={handleSubmit} className="touristspot-form">
            <input
              type="text"
              className="touristspot-input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="number"
              className="touristspot-input"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
            <input
              type="number"
              className="touristspot-input"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
            <select
              className="touristspot-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="beach">Beach</option>
              <option value="park">Park</option>
              <option value="cultural">Cultural Site</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <div className="touristspot-form-actions">
              <button type="submit" className="touristspot-submit-btn">Save</button>
              <button type="button" onClick={onCancel} className="touristspot-cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="experiencecms-container">
      <button className="touristspot-add-btn" onClick={() => setAdding(true)}>
        + Add New Spot
      </button>

      {adding && (
        <TouristSpotForm
          onSubmit={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {editingSpot && (
        <TouristSpotForm
          onSubmit={handleEdit}
          initialData={editingSpot}
          onCancel={() => setEditingSpot(null)}
        />
      )}

      <div className="touristspot-card-grid">
        {spots.map((spot) => (
          <div key={spot.id} className="touristspot-card">
            <img
              src={`http://localhost:3004/uploads/touristspotsmap/${encodeURIComponent(spot.image)}`}
              alt={spot.name}
              className="touristspot-card-image"
            />
            <h4>{spot.name}</h4>
            <p><strong>Lat:</strong> {spot.lat}</p>
            <p><strong>Lng:</strong> {spot.lng}</p>
            <p><strong>Category:</strong> {spot.category}</p>
            <div className="touristspot-card-actions">
              <button className="experiencecms-edit-btn" onClick={() => setEditingSpot(spot)}>Edit</button>
              <button className="experiencecms-delete-btn" onClick={() => handleDelete(spot.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TouristSpots;
