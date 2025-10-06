import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3003/api/explorecms';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200x150?text=No+Image';

export default function ExploreCMS() {
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    city: '',
    email: '',
    contact: '',
    image: null,
    image_path: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch destinations');
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      setMessage('Error loading destinations: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (destination) => {
    setForm({
      id: destination.id,
      title: destination.title,
      city: destination.city || '',
      email: destination.email || '',
      contact: destination.contact || '',
      image: null,
      image_path: destination.image_path || '',
    });
    setMessage('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMessage('Destination deleted.');
      fetchDestinations();
    } catch (err) {
      setMessage('Delete error: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.city) {
      setMessage('Title and City are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('city', form.city);
    formData.append('email', form.email);
    formData.append('contact', form.contact);
    if (form.image) formData.append('image', form.image);

    const isEdit = !!form.id;
    const url = isEdit ? `${API_URL}/${form.id}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setLoading(true);
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');

      setMessage(isEdit ? 'Destination updated!' : 'Destination added!');
      setForm({
        id: null,
        title: '',
        city: '',
        email: '',
        contact: '',
        image: null,
        image_path: '',
      });
      setShowForm(false);
      fetchDestinations();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      id: null,
      title: '',
      city: '',
      email: '',
      contact: '',
      image: null,
      image_path: '',
    });
    setShowForm(false);
    setMessage('');
  };

const getImagePreview = () => {
  if (form.image) {
    return URL.createObjectURL(form.image);
  } else if (form.image_path) {
    return `http://localhost:3003/uploads/top_destinations/${form.image_path}`;
  } else {
    return PLACEHOLDER_IMAGE;
  }
};


  return (
    <div className="explorecms-container">
      <h2>Explore Destinations CMS</h2>

      <button className="btn-add" onClick={() => setShowForm(true)}>
        Add Destination
      </button>
      {message && <p className="message">{message}</p>}

      <ul className="destinations-grid">
        {destinations.map((dest) => (
          <li className="destination-card" key={dest.id}>
            <img
  className="destination-image"
  src={dest.image_path ? `http://localhost:3003/uploads/top_destinations/${dest.image_path}` : PLACEHOLDER_IMAGE}
  alt={dest.title}
/>

            <div className="destination-text">
            <strong>{dest.title || 'No Title'}</strong>
            <p>City:{dest.city || 'Unknown City'}</p>
            {dest.email && <p>Email: {dest.email}</p>}
            {dest.contact && <p>Contact: {dest.contact}</p>}
            {!dest.email && !dest.contact && <p>No contact info</p>}
            </div>
            <div className="actions">
              <button className="btn-edit" onClick={() => handleEdit(dest)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(dest.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <form className="explore-form" onSubmit={handleSubmit}>
              <h3>{form.id ? 'Edit Destination' : 'Add Destination'}</h3>

              <label>Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required />

              <label>City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} required />

              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />

              <label>Contact</label>
              <input type="text" name="contact" value={form.contact} onChange={handleChange} />

              <label htmlFor="image-upload" className="custom-file-button">
                Choose Image
              </label>
              <input type="file" id="image-upload" name="image" accept="image/*" onChange={handleChange} />

              <div className="form-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : form.id ? 'Update' : 'Add'}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>

            <div className="media-preview">
              <img src={getImagePreview()} alt="Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
