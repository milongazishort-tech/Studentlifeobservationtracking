const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler.middleware');
const { NotFoundError } = require('./utils/errors');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const cycleRoutes = require('./routes/cycle.routes');
const checklistRoutes = require('./routes/checklist.routes');
const scoreRoutes = require('./routes/score.routes');
const weeklyRoutes = require('./routes/weekly.routes');
const monthlyRoutes = require('./routes/monthly.routes');
const notificationRoutes = require('./routes/notification.routes');

// Background Automation Jobs
const { initMissedDayCron } = require('./services/cron/missedDayBackfill.job');
const { initReminderCron } = require('./services/cron/reminderDispatcher.job');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors()); // Allow all origins for web frontend and mobile Expo Go
app.use(express.json());

// Apply general API rate limiting to all /api/ endpoints
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Life Tracker Backend API is active and healthy.',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Feature API Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/cycles', cycleRoutes);
app.use('/api/v1/checklist', checklistRoutes);
app.use('/api/v1/scores', scoreRoutes);
app.use('/api/v1/weekly', weeklyRoutes);
app.use('/api/v1/monthly', monthlyRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler for unhandled API routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Resource not found at path: ${req.originalUrl}`));
});

// Centralized Global Error Handler
app.use(errorHandler);

// Start server and connect database
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      // Start background cron jobs
      initMissedDayCron();
      initReminderCron();

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Backend Server] Running on http://localhost:${PORT} and accessible on local network`);
      });
    })
    .catch((err) => {
      console.error('[Backend Server] Failed to connect to database on startup:', err.message);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Backend Server] Running in recovery mode on http://localhost:${PORT}`);
      });
    });
}

module.exports = app;
