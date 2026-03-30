require('dotenv').config();
require('express-async-errors');
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const path      = require('path');
const rateLimit = require('express-rate-limit');

const connectDB      = require('./config/database');
const errorHandler   = require('./middleware/errorHandler');
const notFound       = require('./middleware/notFound');
const authRoutes         = require('./routes/auth');
const ticketRoutes       = require('./routes/tickets');
const commentRoutes      = require('./routes/comments');
const userRoutes         = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const auditRoutes        = require('./routes/audit');
const uploadRoutes       = require('./routes/uploads');

const app = express();

// Trust proxy (required for Railway)
app.set('trust proxy', 1);

// ── HEALTH CHECK FIRST (before anything else) ──────────────────────────────
// Railway pings this to check if server is alive.
// It MUST respond even if DB is not connected yet.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DESK API is running',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── SECURITY ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests.' }
});
app.use('/api/', limiter);

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => o && origin.startsWith(o.replace(/\/$/, '')))) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── STATIC FILES ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/tickets',       ticketRoutes);
app.use('/api/comments',      commentRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit',         auditRoutes);
app.use('/api/upload',        uploadRoutes);

// ── ERROR HANDLERS (must be last) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── START SERVER ─────────────────────────────────────────────────────────────
// Start listening IMMEDIATELY so Railway healthcheck passes
// THEN connect to database
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 DESK API started on port ${PORT}`);
  console.log(`📡 Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

// Connect to DB AFTER server is listening
connectDB();

// ── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
