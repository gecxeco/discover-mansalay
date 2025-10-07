// backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Database initialization
const { getPool } = require("./config/db");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MySQL (Railway or local)
(async () => {
  try {
    await getPool();
    console.log("✅ Connected to MySQL successfully!");
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err.message);
  }
})();

// --- ROUTE MOUNTS --- //
// Each service is modular and mounted under its own route prefix

// Admin service
try {
  const adminRoutes = require("./admin-service/routes/adminRoutes");
  const userRoutes = require("./admin-service/routes/userRoutes");
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/users", userRoutes);
  console.log("✅ Admin service loaded");
} catch (err) {
  console.warn("⚠️ Skipping admin-service routes:", err.message);
}

// CMS service
try {
  const experienceRoutes = require("./cms-service/routes/experience");
  const exploreCMSRoutes = require("./cms-service/routes/explorecms");
  const heroCMSRoutes = require("./cms-service/routes/herocms");
  const highlightCMSRoutes = require("./cms-service/routes/highlightcms");
  const navbarRoutes = require("./cms-service/routes/navbar");
  app.use("/api/cms/experience", experienceRoutes);
  app.use("/api/cms/explore", exploreCMSRoutes);
  app.use("/api/cms/hero", heroCMSRoutes);
  app.use("/api/cms/highlight", highlightCMSRoutes);
  app.use("/api/cms/navbar", navbarRoutes);
  console.log("✅ CMS service loaded");
} catch (err) {
  console.warn("⚠️ Skipping cms-service routes:", err.message);
}

// Destination service
try {
  const destinationRoutes = require("./destination-service/routes/destinations");
  app.use("/api/destinations", destinationRoutes);
  console.log("✅ Destination service loaded");
} catch (err) {
  console.warn("⚠️ Skipping destination-service routes:", err.message);
}

// Map service
try {
  const mapRoutes = require("./map-service/routes/touristSpots");
  app.use("/api/map", mapRoutes);
  console.log("✅ Map service loaded");
} catch (err) {
  console.warn("⚠️ Skipping map-service routes:", err.message);
}

// Search filtering service
try {
  const searchRoutes = require("./searchFiltering-service/routes/search");
  app.use("/api/search", searchRoutes);
  console.log("✅ Search filtering service loaded");
} catch (err) {
  console.warn("⚠️ Skipping searchFiltering-service routes:", err.message);
}

// User service
try {
  const authRoutes = require("./user-service/routes/auth");
  const wishlistRoutes = require("./user-service/routes/wishlist");
  app.use("/api/user", authRoutes);
  app.use("/api/user/wishlist", wishlistRoutes);
  console.log("✅ User service loaded");
} catch (err) {
  console.warn("⚠️ Skipping user-service routes:", err.message);
}

// --- FILES UPLOADS SERVE STATIC --- //
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ROOT ENDPOINT --- //
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Discover Mansalay Backend API Gateway is running",
    services: [
      "/api/admin",
      "/api/cms",
      "/api/destinations",
      "/api/map",
      "/api/search",
      "/api/user",
    ],
  });
});

// --- SERVER LISTEN --- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
