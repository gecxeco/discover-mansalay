import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/api/destinations';

const categories = [
  'Featured Destinations',
  'Beaches',
  'Restaurants',
  'Adventures',
  'Hotels & Resort',
  'Accommodations',
];

const DestinationManager = () => {
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', description: '', image: null });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (form.image) {
      const objectUrl = typeof form.image === 'string'
        ? `http://localhost:5000${form.image}`
        : URL.createObjectURL(form.image);
      setPreview(objectUrl);

      return () => {
        if (typeof form.image !== 'string') URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreview(null);
    }
  }, [form.image]);

  const fetchDestinations = async () => {
    try {
      const res = await axios.get(API_URL);
      setDestinations(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch destinations');
    }
  };

  const openModal = (editItem = null) => {
    if (editItem) {
      setForm({
        name: editItem.name,
        category: editItem.category,
        description: editItem.description || '',
        image: editItem.image || null,
      });
      setPreview(`http://localhost:5000${editItem.image}`);
      setEditingId(editItem.id);
    } else {
      setForm({ name: '', category: '', description: '', image: null });
      setPreview(null);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ name: '', category: '', description: '', image: null });
    setEditingId(null);
    setPreview(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      setForm((prev) => ({ ...prev, image: e.dataTransfer.files[0] }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast.warning('All fields are required');
      return;
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('category', form.category);
    data.append('description', form.description);
    if (form.image && typeof form.image !== 'string') {
      data.append('image', form.image);
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, data);
        toast.success('Destination updated successfully!');
      } else {
        await axios.post(API_URL, data);
        toast.success('Destination added successfully!');
      }

      closeModal();
      fetchDestinations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save destination');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this destination?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Destination deleted');
        fetchDestinations();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete destination');
      }
    }
  };

  return (
    <div className="dm-container">
      <ToastContainer />

      <div className="dm-header">
        <h2>Destination Manager</h2>
        <button className="dm-btn-add" onClick={() => openModal()}>Add Destination</button>
      </div>

      <div className="dm-grid">
        {destinations.map((dest) => (
          <div key={dest.id} className="dm-card">
            <img
              src={`http://localhost:5000${dest.image}`}
              alt={dest.name}
              className="dm-image"
            />
            <div className="dm-content">
              <strong>{dest.name}</strong>
              <small>{dest.category}</small>
              <div className="dm-actions">
                <button className="dm-btn-edit" onClick={() => openModal(dest)}>Edit</button>
                <button className="dm-btn-delete" onClick={() => handleDelete(dest.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="dm-modal-backdrop" onClick={closeModal}>
          <div className="dm-modal" onClick={(e) => e.stopPropagation()}>
           <form onSubmit={handleSubmit} className="dm-form">
  <h3>{editingId ? 'Edit Destination' : 'Add Destination'}</h3>
  
  <div className="dm-form-body">
    <div className="dm-form-left">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <div
        className={`dm-dropzone ${isDragging ? 'active' : ''}`}
        onClick={handleDropZoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {form.image ? (typeof form.image === 'string' ? form.image : form.image.name) : 'Drag & drop or click to select image'}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>

    {preview && (
      <div className="dm-form-preview">
        <img src={preview} alt="Preview" />
      </div>
    )}
  </div>

  <div className="dm-form-actions">
    <button type="submit">{editingId ? 'Update' : 'Create'}</button>
    <button type="button" className="dm-btn-cancel" onClick={closeModal}>Cancel</button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationManager;
