const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.sqlite');

async function openDb() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });
  return db;
}

module.exports = { openDb, DB_FILE };
