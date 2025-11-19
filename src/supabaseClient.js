// Local adapter to emulate the supabase.auth API using a small local server
const API_BASE = process.env.REACT_APP_LOCAL_API_URL || 'http://localhost:54321';
const STORAGE_KEY = 'local_auth_token';

let listeners = [];

function emitAuthEvent(event, session) {
  try {
    listeners.forEach((cb) => cb(event, session));
  } catch (e) {
    console.error('auth event handler error', e);
  }
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, json };
}

async function get(path, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, json };
}

const auth = {
  async signUp({ email, password }) {
    try {
      const { ok, json } = await post('/auth/signup', { email, password });
      if (!ok) return { data: null, error: { message: json?.error || 'signup_failed' } };
      // store token
      const token = json?.session?.access_token;
      if (token) sessionStorage.setItem(STORAGE_KEY, token);
      const session = json.session || null;
      emitAuthEvent('SIGNED_IN', session);
      return { data: json, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },

  async signInWithPassword({ email, password }) {
    try {
      const { ok, json } = await post('/auth/signin', { email, password });
      if (!ok) return { data: null, error: { message: json?.error || 'signin_failed' } };
      const token = json?.session?.access_token;
      if (token) sessionStorage.setItem(STORAGE_KEY, token);
      const session = json.session || null;
      emitAuthEvent('SIGNED_IN', session);
      return { data: json, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },

  async resetPasswordForEmail(email, options) {
    try {
      const { ok, json } = await post('/auth/reset-password', { email, redirectTo: options?.redirectTo });
      if (!ok) return { error: { message: json?.error || 'reset_failed' } };
      return { error: null };
    } catch (err) {
      return { error: { message: err.message } };
    }
  },

  async getSession() {
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);
      if (!token) return { data: { session: null }, error: null };
      const { ok, json } = await get('/auth/session', token);
      if (!ok) return { data: { session: null }, error: null };
      return { data: { session: json.session }, error: null };
    } catch (err) {
      return { data: { session: null }, error: { message: err.message } };
    }
  },

  async signOut() {
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);
      await post('/auth/signout', {});
      sessionStorage.removeItem(STORAGE_KEY);
      emitAuthEvent('SIGNED_OUT', null);
      return { error: null };
    } catch (err) {
      return { error: { message: err.message } };
    }
  },

  onAuthStateChange(callback) {
    listeners.push(callback);
    const subscription = {
      unsubscribe() {
        listeners = listeners.filter((c) => c !== callback);
      }
    };
    return { data: { subscription } };
  }
};

export const supabase = { auth };