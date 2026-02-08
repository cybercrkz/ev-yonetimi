// Basit tarayıcı tabanlı kimlik yönetimi (localStorage)
const USERS_KEY = 'ev_users';
const SESSION_KEY = 'ev_session';

const readJSON = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    console.error('localStorage read error', e);
    return null;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write error', e);
  }
};

const loadUsers = () => readJSON(USERS_KEY) || [];
const saveUsers = (users) => writeJSON(USERS_KEY, users);

const getSession = async () => {
  const session = readJSON(SESSION_KEY);
  return { data: { session: session || null }, error: null };
};

const createSessionForUser = (user) => {
  const session = { user: { id: user.id, email: user.email }, created_at: new Date().toISOString() };
  writeJSON(SESSION_KEY, session);
  // dispatch global auth event
  window.dispatchEvent(new CustomEvent('ev_auth', { detail: { event: 'SIGNED_IN', session } }));
  return session;
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent('ev_auth', { detail: { event: 'SIGNED_OUT', session: null } }));
};

const signUp = async ({ email, password }) => {
  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return { data: null, error: { message: 'Kullanıcı zaten var' } };
  }
  const id = 'u_' + Date.now();
  const user = { id, email, password };
  users.push(user);
  saveUsers(users);
  const session = createSessionForUser(user);
  return { data: { user, session }, error: null };
};

const signInWithPassword = async ({ email, password }) => {
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { data: null, error: { message: 'Geçersiz e-posta veya şifre' } };
  }
  const session = createSessionForUser(user);
  return { data: { user: { id: user.id, email: user.email }, session }, error: null };
};

const signOut = async () => {
  clearSession();
  return { error: null };
};

const resetPasswordForEmail = async (email) => {
  // Gerçekte e-posta gönderilmez. Sadece mock davranışı.
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return { error: { message: 'Kayıtlı e-posta bulunamadı' } };
  }
  return { error: null };
};

const onAuthStateChange = (callback) => {
  const handler = (e) => {
    const { event, session } = e.detail || {};
    callback(event, session);
  };
  window.addEventListener('ev_auth', handler);

  // return object similar to Supabase shape
  return { data: { subscription: { unsubscribe: () => window.removeEventListener('ev_auth', handler) } } };
};

export const browserAuth = {
  getSession,
  signUp,
  signInWithPassword,
  signOut,
  resetPasswordForEmail,
  onAuthStateChange,
};

export default browserAuth;
