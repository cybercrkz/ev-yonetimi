const fs = require('fs');
const path = require('path');
const { openDb, DB_FILE } = require('../db');

// __dirname is server/migrations, so go up two levels to project root
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'supabase', 'migrations');

async function runMigrations() {
  const db = await openDb();

  // Ensure users table for auth
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create bills table (SQLite-compatible)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT NOT NULL,
      bill_type TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      payment_date TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  // Create expenses table (SQLite-compatible)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL
    );
  `);

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn('No migrations dir found at', MIGRATIONS_DIR);
    return;
  }

  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const fullPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    // Basic cleanup: remove Postgres-specific statements (OWNER TO, SET search_path, etc.)
    const cleaned = sql
      .replace(/--.*$/gm, '')
      .replace(/SET\s+[^;]+;/g, '')
      .replace(/COMMENT ON COLUMN [^;]+;/g, '')
      .replace(/CREATE EXTENSION IF NOT EXISTS [^;]+;/g, '')
      .replace(/TYPE [^;]+;/g, '');

    // Split by semicolon and run each statement
    const statements = cleaned.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await db.exec(stmt + ';');
      } catch (err) {
        // Log and continue — many Postgres-specific things will fail, but table CREATE should work
        console.warn('Migration statement failed (continuing):', err.message);
      }
    }
  }
}

module.exports = runMigrations;
