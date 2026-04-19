const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes         = require('./routes/auth');
const profileRoutes      = require('./routes/profile');
const userRoutes         = require('./routes/user');
const matchRoutes        = require('./routes/match');
const chatRoutes         = require('./routes/chat');
const notifRoutes        = require('./routes/notifications');
const teamChatRoutes     = require('./routes/teamChat');
const { initSocket }     = require('./services/socketManager');

const app = express();
const server = http.createServer(app);

// ── WebSocket (real-time) ─────────────────────────────────────
initSocket(server);

// ── Security ──────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 200, message: { error: 'Too many requests' } }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 15, message: { error: 'Too many auth attempts' } }));

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Static Files ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://anushkajagtap2212_db_user:Anushkarj22@hackmatchai.fzmsbkn.mongodb.net/')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/match',         matchRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/team-chat',     teamChatRoutes);

// ── Health ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const { getOnlineCount } = require('./services/socketManager');
  res.json({ status: 'healthy', onlineUsers: getOnlineCount(), version: '2.0.0', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: Object.values(err.errors).map(e => e.message) });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `${field} already exists` });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = 9999;
console.log('Starting server on port:', PORT);
console.log('PORT env var:', process.env.PORT);
server.listen(PORT, () => {
  console.log(`🚀 HackMatch AI v2 running on http://localhost:${PORT}`);
  console.log(`   WebSockets: enabled`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? 'configured' : 'using rule-based fallback'}`);
});

app.use(cors({
  origin: [
    "http://localhost:3000", // local dev
    "https://your-frontend.vercel.app" // production frontend
  ],
  credentials: true
}));

module.exports = { app, server };
