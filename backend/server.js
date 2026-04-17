const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const aiRoutes = require('./routes/ai.routes');
const { sanitizePayload } = require('./middlewares/validation');

const app = express();
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resumeAI';

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: allowedOrigins !== '*',
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }

  next();
});

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/api/ai/', rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'AI limit reached.' },
}));

mongoose.set('sanitizeFilter', true);
mongoose.connection.on('connected', () => {
  console.log(`MongoDB Connected: ${mongoUri}`);
});
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connection established'))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error.message);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}/api/health`);
});

module.exports = app;
