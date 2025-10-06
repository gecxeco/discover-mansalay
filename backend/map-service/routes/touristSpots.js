const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../../config/db');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads/touristspotsmap');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// GET all tourist spots
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM tourist_spots ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tourist spots' });
  }
});

// ADD a new tourist spot
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, lat, lng, category } = req.body;
    const image = req.file?.filename;

    if (!name || !lat || !lng || !image || !category) {
      return res.status(400).json({ error: 'All fields (name, lat, lng, image, category) are required.' });
    }

    const pool = await getPool();
    await pool.query(
      'INSERT INTO tourist_spots (name, lat, lng, category, image) VALUES (?, ?, ?, ?, ?)',
      [name, parseFloat(lat), parseFloat(lng), category, image]
    );

    res.status(201).json({ message: 'Tourist spot added successfully.' });
  } catch (err) {
    console.error('Error adding spot:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// UPDATE an existing tourist spot
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lat, lng, category } = req.body;
    const image = req.file?.filename;

    const pool = await getPool();
    const [rows] = await pool.query('SELECT image FROM tourist_spots WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tourist spot not found.' });

    const oldImage = rows[0].image;
    if (image && oldImage) {
      const oldPath = path.join(uploadDir, oldImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query(
      `UPDATE tourist_spots
       SET name = ?, lat = ?, lng = ?, category = ?, image = COALESCE(?, image)
       WHERE id = ?`,
      [name, parseFloat(lat), parseFloat(lng), category, image, id]
    );

    res.json({ message: 'Tourist spot updated successfully.' });
  } catch (err) {
    console.error('Error updating spot:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE a tourist spot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const [rows] = await pool.query('SELECT image FROM tourist_spots WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const filename = rows[0].image;
    if (filename) {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM tourist_spots WHERE id = ?', [id]);
    res.json({ message: 'Tourist spot deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting tourist spot' });
  }
});

module.exports = router;
