require("dotenv").config();
const path = require('path');
const dotenv = require('dotenv');
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
// Supports either a .env beside server.js or the existing parent-folder .env.
dotenv.config({ path: path.resolve(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./src/middleware/errors');
const authRoutes = require('./src/routes/auth');
const placeRoutes = require('./src/routes/places');
const storyRoutes = require('./src/routes/stories');
const trailRoutes = require('./src/routes/trails');
const chatRoutes = require('./src/routes/chat');
const { ensureBootstrapAdmin } = require('./src/services/bootstrap');

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/', (_req, res) => res.json({ success: true, name: 'Local Heritage Trail Explorer API', version: '1.0.0' }));
app.get('/api/health', (_req, res) => res.json({ success: true, server: 'running', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/trails', trailRoutes);
app.use('/api/chat', chatRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Set it in .env in this folder or its parent folder.');
    process.exit(1);
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error('SESSION_SECRET must be set to a random secret of at least 32 characters.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB Atlas');
  await ensureBootstrapAdmin();
  app.listen(PORT, () => console.log(`Heritage Explorer API running at http://localhost:${PORT}`));
}
start().catch(err => { console.error('Backend startup failed:', err.message); process.exit(1); });
