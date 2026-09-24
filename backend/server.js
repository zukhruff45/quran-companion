require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initErrorTracking, captureException } = require('./utils/errorTracking');

// Initialize Error Tracking (catches uncaught exceptions/rejections)
initErrorTracking();

const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmarks');
const historyRoutes = require('./routes/history');
const userRoutes = require('./routes/users');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per `window`
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get('/', (req, res) => {
  res.send('Quran Companion API is running.');
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  // Always track errors in production to avoid silent failures
  captureException(err, req);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS Error: Origin not allowed' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is missing.');
  console.error('Please configure it in your .env file with your MongoDB Atlas connection string.');
  process.exit(1);
}

const connectDB = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Connected to MongoDB Atlas successfully.');
      }
      
      // Bind to 0.0.0.0 for external access (e.g. Render/Railway)
      app.listen(PORT, '0.0.0.0', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Server is running on port ${PORT}`);
        }
      });
      return;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`Error connecting to MongoDB (Attempt ${i + 1}/${retries}):`, error.message);
      }
      if (i < retries - 1) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Retrying connection in ${delay / 1000} seconds...`);
        }
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('Failed to connect to MongoDB Atlas after multiple retries. Exiting.');
        process.exit(1);
      }
    }
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

module.exports = app;
