require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const rateLimit = require('express-rate-limit');

const connectDB     = require('./config/database');
const errorHandler  = require('./middleware/errorHandler');
const notFound      = require('./middleware/notFound');

const authRoutes         = require('./routes/auth');
const ticketRoutes       = require('./routes/tickets');
const commentRoutes      = require('./routes/comments');
const userRoutes         = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const auditRoutes        = require('./routes/audit');
const uploadRoutes       = require('./routes/uploads');

const app = express();

// Connect Database
connectDB();

// Trust proxy (needed for Railway/Render/Vercel)
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS — allow multiple origins for dev + prod
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth',          authRoutes);
app.use('/api/tickets',       ticketRoutes);
app.use('/api/comments',      commentRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit',         auditRoutes);
app.use('/api/upload',        uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DESK API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 DESK API — ${process.env.NODE_ENV || 'development'} — port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
