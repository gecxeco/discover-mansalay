const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPool } = require('../../config/db');
const fs = require('fs');

// Ensure uploads/highlightevents directory exists
const uploadDir = path.join(__dirname, '../../uploads/highlightevents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sanitize title for filename
function sanitizeTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // replace spaces with dashes
    .replace(/[^a-z0-9\-]/g, ''); // remove non-alphanumeric
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const title = req.body.title || 'untitled';
    const ext = path.extname(file.originalname);
    const filename = `${sanitizeTitle(title)}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// GET all events
router.get('/highlight-events', async (req, res) => {
  try {
    const pool = await getPool();
    const [results] = await pool.query('SELECT * FROM highlight_events');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new event
router.post('/highlight-events', upload.single('image'), async (req, res) => {
  const { title, description, date_range, link } = req.body;
  const image_url = req.file?.filename || '';

  try {
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO highlight_events (title, description, date_range, image_url, link) VALUES (?, ?, ?, ?, ?)',
      [title, description, date_range, image_url, link]
    );
    res.status(201).json({ message: 'Event created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update event
router.put('/highlight-events/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, date_range, link } = req.body;
  const newImage = req.file?.filename;

  try {
    const pool = await getPool();

    // Get existing image filename
    const [[event]] = await pool.query('SELECT image_url FROM highlight_events WHERE id=?', [id]);
    const oldImage = event?.image_url;

    let query = 'UPDATE highlight_events SET title=?, description=?, date_range=?, link=?';
    const params = [title, description, date_range, link];

    if (newImage) {
      query += ', image_url=?';
      params.push(newImage);

      // Delete old image file (if it exists)
      if (oldImage && fs.existsSync(path.join(uploadDir, oldImage))) {
        fs.unlink(path.join(uploadDir, oldImage), err => {
          if (err) console.error('[DELETE IMAGE ERROR]', err);
        });
      }
    }

    query += ' WHERE id=?';
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event + file
router.delete('/highlight-events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();

    // Get image filename
    const [[event]] = await pool.query('SELECT image_url FROM highlight_events WHERE id=?', [id]);
    const imageFile = event?.image_url;

    // Delete from DB
    await pool.query('DELETE FROM highlight_events WHERE id=?', [id]);

    // Delete file from disk
    if (imageFile) {
      const filePath = path.join(uploadDir, imageFile);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, err => {
          if (err) console.error('[DELETE IMAGE ERROR]', err);
        });
      }
    }

    res.json({ message: 'Event and image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
