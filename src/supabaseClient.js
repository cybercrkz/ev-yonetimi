import { createClient } from '@supabase/supabase-js';
import { browserAuth } from './lib/browserAuth';
import { browserData } from './lib/browserData';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Eğer environment değişkenleri varsa gerçek Supabase istemcisini oluştur
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  class SupabaseClient {
    constructor() {
      if (SupabaseClient.instance) {
        return SupabaseClient.instance;
      }

      this.client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        }
      });

      SupabaseClient.instance = this;
    }

    getClient() {
      return this.client;
    }
  }

  const supabaseInstance = new SupabaseClient();
  supabase = supabaseInstance.getClient();
} else {
  // .env tanımlı değilse uygulamanın çökmesini önlemek için basit bir mock sağlayalım.
  const buildQuery = (table, filters = {}) => {
    return {
      select() {
        return {
          then: async (resolve) => {
            try {
              const userId = filters.user_id;
              if (table === 'bills' && filters.__range) {
                const { fromISO, toISO, limit } = filters.__range;
                const r = await browserData.getUpcomingBills(userId, fromISO, toISO, limit || 5);
                resolve(r);
                return;
              }

              if (table === 'bills') {
                const r = await browserData.getBillsForUser(userId);
                resolve(r);
                return;
              }
              if (table === 'expenses') {
                const r = await browserData.getExpensesForUser(userId);
                resolve(r);
                return;
              }
              if (table === 'todos') {
                const r = await browserData.getTodosForUser(userId);
                resolve(r);
                return;
              }
              if (table === 'shopping_items') {
                const r = await browserData.getShoppingItemsForUser(userId);
                resolve(r);
                return;
              }

              resolve({ data: [], error: null });
            } catch (e) {
              resolve({ data: null, error: e });
            }
          }
        };
      },
      eq(key, value) {
        filters[key] = value;
        return this;
      },
      gte(key, value) {
        filters['__gte_' + key] = value;
        return this;
      },
      lte(key, value) {
        filters['__lte_' + key] = value;
      return this;
      },
      order() { return this; },
      limit(n) { filters.__limit = n; return this; },
      rangeDates(fromISO, toISO) { filters.__range = { fromISO, toISO, limit: filters.__limit }; return this; }
    };
  };

  const mockSupabase = {
    auth: {
      getSession: browserAuth.getSession,
      signUp: browserAuth.signUp,
      signInWithPassword: browserAuth.signInWithPassword,
      signOut: browserAuth.signOut,
      resetPasswordForEmail: browserAuth.resetPasswordForEmail,
      onAuthStateChange: browserAuth.onAuthStateChange,
    },
    from(table) {
      const builder = buildQuery(table, {});
      builder.withDateRange = function(fromISO, toISO, limit) {
        this.rangeDates(fromISO, toISO);
        if (limit) this.limit(limit);
        return this;
      };
      return builder;
    }
  };

  supabase = mockSupabase;
}

export { supabase };