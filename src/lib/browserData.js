// Basit tarayıcı tabanlı veri depolama (localStorage)
const KEY_PREFIX = 'ev_';

const readJSON = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : [];
  } catch (e) {
    console.error('localStorage read error', e);
    return [];
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write error', e);
  }
};

const loadTable = (table) => readJSON(KEY_PREFIX + table);
// saveTable helper removed (unused) — using generic saveTableGeneric instead

const getUpcomingBills = async (userId, fromISO, toISO, limit = 5) => {
  const bills = loadTable('bills');
  const res = bills
    .filter(b => b.user_id === userId && b.status === 'pending')
    .filter(b => new Date(b.due_date) >= new Date(fromISO) && new Date(b.due_date) <= new Date(toISO))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, limit);
  return { data: res, error: null };
};

const getBillsForUser = async (userId) => {
  const bills = loadTable('bills').filter(b => b.user_id === userId);
  return { data: bills, error: null };
};

const getExpensesForUser = async (userId) => {
  const expenses = loadTable('expenses').filter(e => e.user_id === userId);
  return { data: expenses, error: null };
};

const getTodosForUser = async (userId) => {
  const todos = loadTable('todos').filter(t => t.user_id === userId);
  return { data: todos, error: null };
};

const getShoppingItemsForUser = async (userId) => {
  const items = loadTable('shopping_items').filter(i => i.user_id === userId);
  return { data: items, error: null };
};

export const browserData = {
  getUpcomingBills,
  getBillsForUser,
  getExpensesForUser,
  getTodosForUser,
  getShoppingItemsForUser,
};

export default browserData;

// --- CRUD helpers ---
const loadTableGeneric = (table) => readJSON(KEY_PREFIX + table);
const saveTableGeneric = (table, data) => writeJSON(KEY_PREFIX + table, data);

const insertInto = async (table, rows) => {
  const data = loadTableGeneric(table);
  const inserted = rows.map(row => {
    const id = `${table.slice(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    return { id, ...row, created_at: now, updated_at: now };
  });
  const newData = [...inserted, ...data];
  saveTableGeneric(table, newData);
  return { data: inserted, error: null };
};

const updateById = async (table, id, changes) => {
  const data = loadTableGeneric(table);
  let found = false;
  const newData = data.map(row => {
    if (row.id === id) {
      found = true;
      return { ...row, ...changes, updated_at: new Date().toISOString() };
    }
    return row;
  });
  if (!found) return { data: null, error: { message: 'Kayıt bulunamadı' } };
  saveTableGeneric(table, newData);
  return { data: null, error: null };
};

const deleteById = async (table, id) => {
  const data = loadTableGeneric(table);
  const newData = data.filter(row => row.id !== id);
  saveTableGeneric(table, newData);
  return { data: null, error: null };
};

const getProfileById = async (id) => {
  const profiles = loadTableGeneric('profiles');
  const p = profiles.find(x => x.id === id) || null;
  return { data: p, error: null };
};

const upsertProfile = async (profile) => {
  const profiles = loadTableGeneric('profiles');
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...profiles[existingIndex], ...profile, updated_at: now };
  } else {
    profiles.push({ ...profile, created_at: now, updated_at: now });
  }
  saveTableGeneric('profiles', profiles);
  return { error: null };
};

const clearAllData = async () => {
  const PRESERVE_KEYS = ['ev_users', 'ev_session'];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(KEY_PREFIX) && !PRESERVE_KEYS.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  return { error: null };
};

// extend export
browserData.insertInto = insertInto;
browserData.updateById = updateById;
browserData.deleteById = deleteById;
browserData.getProfileById = getProfileById;
browserData.upsertProfile = upsertProfile;
browserData.clearAllData = clearAllData;
