import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:3003/api/experiencecms';

const ExperienceCMS = () => {
  const [cards, setCards] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', image: null, link: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCards(data);
    } catch (error) {
      console.error('Failed to fetch experience cards:', error);
      toast.error('Failed to load experience cards');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleEdit = card => {
    setEditingId(card.id);
    setForm({ title: card.title, image: null, link: card.link || '' });
    setShowForm(true);
  };

  const handleDelete = async id => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

      if (res.ok) {
        toast.success('Card deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete the card');
      }
    } catch (error) {
      toast.error('Error deleting card');
      console.error(error);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.warn('Title is required');
      return;
    }
    if (!form.link.trim()) {
      toast.warn('Link is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('link', form.link);
    if (form.image) formData.append('image', form.image);

    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (res.ok) {
        toast.success(editingId ? 'Card updated successfully' : 'Card added successfully');
        fetchData();
        setEditingId(null);
        setForm({ title: '', image: null, link: '' });
        setShowForm(false);
      } else {
        toast.error('Failed to save the card');
      }
    } catch (error) {
      toast.error('Error saving card');
      console.error(error);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm({ title: '', link: '', image: null });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', link: '', image: null });
    setShowForm(false);
  };

  return (
    <div className="experiencecms-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="experiencecms-title">Manage Experience Cards</h2>
        {!showForm && cards.length < 6 && (
          <button className="experiencecms-add-btn" onClick={handleAddNew}>
            Add New Card
          </button>
        )}
      </div>

      <div className="experiencecms-card-list">
        {[...Array(6)].map((_, i) => {
          const card = cards[i];
          return card ? (
            <div key={card.id} className="experiencecms-card">
              <img
                src={`http://localhost:3003/uploads/${card.image_path}`}
                alt={card.title}
                className="experiencecms-image"
              />
              <span className="experiencecms-card-title">{card.title}</span>
              {card.link && (
                <a
                  href={card.link}
                  target="_blank"
                  rel="noreferrer"
                  className="experiencecms-link"
                >
                  Visit Link
                </a>
              )}
              <div className="experiencecms-card-actions">
                <button
                  className="experiencecms-edit-btn"
                  onClick={() => handleEdit(card)}
                >
                  Edit
                </button>
                <button
                  className="experiencecms-delete-btn"
                  onClick={() => handleDelete(card.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div key={i} className="experiencecms-card empty">
              Empty slot {i + 1}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="experiencecms-modal-overlay">
          <div className="experiencecms-modal">
            <form onSubmit={handleSubmit} className="experiencecms-form">
              <h3 className="experiencecms-form-title">
                {editingId ? 'Edit Card' : 'Add New Card'}
              </h3>
              <input
                type="text"
                name="title"
                className="experiencecms-input"
                value={form.title}
                onChange={handleChange}
                placeholder="Card Title"
                required
              />
              <input
                type="text"
                name="link"
                className="experiencecms-input"
                value={form.link}
                onChange={handleChange}
                placeholder="Card Link (https://example.com)"
                required
              />
              <input
                type="file"
                name="image"
                className="experiencecms-input"
                accept="image/*"
                onChange={handleChange}
                required={!editingId}
              />
              <div className="experiencecms-form-actions">
                <button type="submit" className="experiencecms-submit-btn">
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="experiencecms-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceCMS;
