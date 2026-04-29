require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// ─── Route modules ────────────────────────────────────────────────────────────
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const attendeeRoutes = require('./modules/attendees/attendees.routes');
const eventRoutes = require('./modules/events/events.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const sponsorRoutes = require('./modules/sponsors/sponsors.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again in a minute.' },
});

app.use(globalLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API}/auth`, authLimiter, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/attendees`, attendeeRoutes);
app.use(`${API}/events`, eventRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/sponsors`, sponsorRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get(`${API}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AudienceAI API is running',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AudienceAI API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}${API}`);
});

module.exports = app;
