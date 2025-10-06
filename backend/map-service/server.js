// backend/map-service/index.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const { getPool } = require('../config/db'); // adjust path as needed

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images (ensure this path exists in repo structure)
app.use('/uploads/touristspotsmap', express.static(path.join(__dirname, '../uploads/touristspotsmap')));

// Routes
const touristSpotsRoutes = require('./routes/touristSpots');
app.use('/map/touristspots', touristSpotsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'unavailable', message: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
(async function start() {
  try {
    await getPool();
    const PORT = process.env.PORT || 3004;
    app.listen(PORT, () => console.log(`🚀 Map service running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to initialize DB for Map service:', err.message);
    process.exit(1);
  }
})();
