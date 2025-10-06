const express = require('express');
const cors = require('cors');
const path = require('path');
const { getPool } = require('../config/db'); // ✅ adjust path based on your structure

// Import routes
const navbarRoutes = require('./routes/navbar');
const heroRoutes = require('./routes/herocms');
const exploreRoutes = require('./routes/explorecms');
const highlightcmsRoutes = require('./routes/highlightcms');
const experienceRoutes = require('./routes/experience');

const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📂 Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🧭 API Routes
app.use('/api/navbar', navbarRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/explorecms', exploreRoutes);
app.use('/api/highlightcms', highlightcmsRoutes);
app.use('/api/experiencecms', experienceRoutes);

// 🧠 Health check route (useful for Railway logs)
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'unavailable', message: err.message });
  }
});

// ⚠️ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 🚀 Start Server (only after DB is initialized)
(async function start() {
  try {
    await getPool(); // initialize DB & ensure tables
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`🚀 CMS service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1); // Railway will auto-restart if DB is temporarily unavailable
  }
})();
