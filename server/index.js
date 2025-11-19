const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const { openDb } = require('./db');
const runMigrations = require('./migrations/runMigrations');

const SECRET = process.env.LOCAL_AUTH_SECRET || 'dev_secret_change_me';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../build')));

// API routes
app.get('/health', (req, res) => res.json({ ok: true }));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Run migrations (safe to call multiple times)
app.post('/migrate', async (req, res) => {
  try {
    await runMigrations();
    res.json({ ok: true });
  } catch (err) {
    console.error('migration error', err);
    res.status(500).json({ error: err.message });
  }
});

// Sign up
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const db = await openDb();
  const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(400).json({ error: 'user_exists' });
  const hash = await bcrypt.hash(password, 10);
  const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
  const userId = result.lastID;
  const token = jwt.sign({ sub: userId, email }, SECRET, { expiresIn: '7d' });
  res.json({ user: { id: userId, email }, session: { access_token: token } });
});

// Sign in
app.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const db = await openDb();
  const user = await db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
  if (!user) return res.status(400).json({ error: 'invalid_credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ sub: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, email: user.email }, session: { access_token: token } });
});

// Sign out (client-side can just drop token) - provide endpoint for parity
app.post('/auth/signout', (req, res) => {
  res.json({ ok: true });
});

// Reset password - in local setup we just acknowledge and log the request
app.post('/auth/reset-password', async (req, res) => {
  const { email, redirectTo } = req.body;
  console.log('Password reset requested for', email, 'redirectTo', redirectTo);
  // In a real setup you'd send an email. Here we just return ok.
  res.json({ ok: true });
});

// Get session (decode token from Authorization)
app.get('/auth/session', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ session: null });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, SECRET);
    res.json({ session: { user: { id: payload.sub, email: payload.email } } });
  } catch (err) {
    return res.json({ session: null });
  }
});

// Simple example endpoints for bills and expenses
app.get('/bills', async (req, res) => {
  const db = await openDb();
  const rows = await db.all('SELECT * FROM bills');
  res.json(rows);
});

app.get('/expenses', async (req, res) => {
  const db = await openDb();
  const rows = await db.all('SELECT * FROM expenses');
  res.json(rows);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Local auth/DB server running on http://localhost:${PORT}`);
});
