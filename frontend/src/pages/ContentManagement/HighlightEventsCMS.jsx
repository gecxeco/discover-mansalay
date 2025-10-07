import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImageUtil';
import { toast } from 'react-toastify';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';
const API_URL = `${API_BASE_URL}/api/highlightcms/highlight-events`;
const UPLOADS_BASE = `${API_BASE_URL}/uploads/highlightevents/`;

const HighlightEventsCMS = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date_range: { startDate: new Date(), endDate: new Date(), key: 'selection' },
    link: '',
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageFile, setCroppedImageFile] = useState(null);

  // ✅ Fetch all highlight events
  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_URL);
      setEvents(res.data);
    } catch (e) {
      console.error('Failed to fetch events', e);
      toast.error('Failed to fetch events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Open Add/Edit Modal
  const openModal = (event = null) => {
    if (event) {
      setEditId(event.id);
      const [start, end] = event.date_range.split(' - ');
      setForm({
        title: event.title,
        description: event.description,
        date_range: {
          startDate: new Date(start),
          endDate: new Date(end),
          key: 'selection',
        },
        link: event.link,
        image: null,
      });
      setImageSrc(`${UPLOADS_BASE}${event.image_url}`);
      setCroppedImageFile(null);
    } else {
      setEditId(null);
      setForm({
        title: '',
        description: '',
        date_range: { startDate: new Date(), endDate: new Date(), key: 'selection' },
        link: '',
        image: null,
      });
      setImageSrc(null);
      setCroppedImageFile(null);
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      title: '',
      description: '',
      date_range: { startDate: new Date(), endDate: new Date(), key: 'selection' },
      link: '',
      image: null,
    });
    setImageSrc(null);
    setCroppedImageFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const readFile = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.readAsDataURL(file);
    });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setForm((f) => ({ ...f, image: file }));
      if (file) {
        const imageDataUrl = await readFile(file);
        setImageSrc(imageDataUrl);
        setCroppedImageFile(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        setImageSrc(null);
        setCroppedImageFile(null);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleDateRangeChange = (ranges) => {
    setForm((f) => ({ ...f, date_range: ranges.selection }));
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File(
        [croppedBlob],
        form.image ? form.image.name : 'croppedImage.jpeg',
        { type: croppedBlob.type }
      );
      setCroppedImageFile(croppedFile);
      toast.success('Image cropped successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  }, [croppedAreaPixels, imageSrc, form.image]);

  // ✅ Add or Update Event
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.link.trim()) {
      toast.warn('Please fill in all required fields');
      return;
    }

    const imageToUpload = croppedImageFile || form.image;
    const formattedDateRange = `${format(form.date_range.startDate, 'MMM d')} - ${format(form.date_range.endDate, 'MMM d')}`;

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('date_range', formattedDateRange);
    formData.append('link', form.link);
    if (imageToUpload) formData.append('image', imageToUpload);

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success('Event updated successfully');
      } else {
        await axios.post(API_URL, formData);
        toast.success('Event added successfully');
      }
      closeModal();
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('Error saving event');
    }
  };

  // ✅ Delete Event
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="highlightcms-container">
      <h2 className="highlightcms-title">Manage Highlight Events</h2>
      <button className="highlightcms-add-btn" onClick={() => openModal()}>
        + Add New Event
      </button>

      <div className="highlightcms-event-list">
        {events.map((event) => (
          <div key={event.id} className="highlightcms-event-card">
            <img
              src={`${UPLOADS_BASE}${event.image_url}`}
              alt={event.title}
              className="highlightcms-event-image"
            />
            <h3 className="highlightcms-event-title">{event.title}</h3>
            <p className="highlightcms-event-desc">{event.description}</p>
            <p className="highlightcms-event-date">{event.date_range}</p>
            <div className="highlightcms-event-actions">
              <button className="highlightcms-edit-btn" onClick={() => openModal(event)}>
                Edit
              </button>
              <button className="highlightcms-delete-btn" onClick={() => handleDelete(event.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="highlightcms-modal-backdrop" onClick={closeModal}>
          <div className="highlightcms-modal-content" onClick={(e) => e.stopPropagation()} style={{ display: 'flex' }}>
            <form className="highlightcms-form" onSubmit={handleSubmit} encType="multipart/form-data" style={{ flex: 1 }}>
              <h3 className="highlightcms-form-title">{editId ? 'Edit Event' : 'Add New Event'}</h3>

              <label htmlFor="title" className="highlightcms-label">Title</label>
              <input type="text" id="title" name="title" value={form.title} onChange={handleChange} className="highlightcms-input" required placeholder="Enter event title" />

              <label htmlFor="description" className="highlightcms-label">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} className="highlightcms-textarea" required placeholder="Enter event description" />

              <label className="highlightcms-label">Date Range</label>
              <DateRange
                editableDateInputs={true}
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={[form.date_range]}
                className="highlightcms-daterange-picker"
              />

              <label htmlFor="link" className="highlightcms-label">Link</label>
              <input type="url" id="link" name="link" value={form.link} onChange={handleChange} className="highlightcms-input" placeholder="Enter link URL" required />

              <div className="highlightcms-modal-footer">
                <button type="submit" className="highlightcms-submit-btn">{editId ? 'Update' : 'Add'} Event</button>
                <button type="button" onClick={closeModal} className="highlightcms-cancel-btn">Cancel</button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem' }}>
              <div className="highlightcms-image-preview">
                {imageSrc ? (
                  !croppedImageFile ? (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 3}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  ) : (
                    <img src={URL.createObjectURL(croppedImageFile)} alt="Cropped" className="highlightcms-preview-image" />
                  )
                ) : (
                  <div className="highlightcms-preview-placeholder">No image selected</div>
                )}
              </div>

              <label htmlFor="image" className="highlightcms-label custom-file-label" style={{ marginTop: '1rem' }}>
                {form.image ? form.image.name : 'Choose Image'}
                <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} className="highlightcms-file-input" />
              </label>

              <button type="button" onClick={showCroppedImage} className="highlightcms-crop-btn" disabled={!imageSrc} style={{ marginTop: '1rem', width: '100%' }}>
                Crop Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighlightEventsCMS;
