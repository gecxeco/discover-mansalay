import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NavbarCMS = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetch('http://localhost:3003/api/navbar')
      .then(res => res.json())
      .then(data => {
        if (data.logo) {
          setPreview(`http://localhost:3003/uploads/${data.logo}`);
        }
      })
      .catch(err => {
        console.error('Error fetching logo:', err);
        toast.error('Error loading current logo');
      });
  }, []);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warn('Please select a file before uploading');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('http://localhost:3003/api/navbar/logo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Logo updated successfully!');
        setPreview(`http://localhost:3003/uploads/${data.logo}`);
        setFile(null);
      } else {
        toast.error(data.error || 'Failed to update logo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading logo');
    }
  };

  return (
    <div className="navbar-container">
      <h2 className="navbar-title">Change Logo</h2>
      <form className="navbar-form" onSubmit={onSubmit}>
        <div className="navbar-preview-container">
          <label className="navbar-label">Current Logo Preview:</label>
          {preview ? (
            <img src={preview} alt="Logo Preview" className="navbar-logo-preview" />
          ) : (
            <p className="navbar-no-logo">No logo available</p>
          )}
        </div>

        <div className="navbar-input-group">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="navbar-file-input"
          />
        </div>

        <button type="submit" className="navbar-submit-btn">
          Upload New Logo
        </button>
      </form>
    </div>
  );
};

export default NavbarCMS;
