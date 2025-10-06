const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../../config/db');

// Ensure uploads/logo directory exists
const logoDir = path.join(__dirname, '../../uploads/logo');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'logo' + ext); // Save as 'logo.png' or 'logo.jpg'
  },
});
const upload = multer({ storage });

// GET current navbar logo info
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [results] = await pool.query('SELECT * FROM navbar LIMIT 1');
    if (results.length === 0) return res.json({ logo: '' });
    res.json({ logo: results[0].logo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update navbar logo
router.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Correct URL path to be browser accessible
  const logoPath = `logo/${req.file.filename}`;

  try {
    const pool = await getPool();
    const [result] = await pool.query('UPDATE navbar SET logo = ? WHERE id = 1', [logoPath]);

    if (result.affectedRows === 0) {
      await pool.query('INSERT INTO navbar (id, logo) VALUES (1, ?)', [logoPath]);
    }

    res.json({ message: 'Logo uploaded successfully', logo: logoPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
