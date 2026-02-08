import { supabase } from './supabase';

export const browserData = {
  // --- Bills ---
  getUpcomingBills: async (userId, fromISO, toISO, limit = 5) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', fromISO)
      .lte('due_date', toISO)
      .order('due_date', { ascending: true })
      .limit(limit);
    return { data, error };
  },

  getBillsForUser: async (userId) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    return { data, error };
  },

  // --- Expenses ---
  getExpensesForUser: async (userId) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  // --- Todos ---
  getTodosForUser: async (userId) => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // --- Shopping Items ---
  getShoppingItemsForUser: async (userId) => {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // --- Incomes ---
  getIncomesForUser: async (userId) => {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  // --- Generic CRUD ---
  insertInto: async (table, rows) => {
    const { data, error } = await supabase
      .from(table)
      .insert(rows)
      .select();
    return { data, error };
  },

  updateById: async (table, id, changes) => {
    const { data, error } = await supabase
      .from(table)
      .update(changes)
      .eq('id', id)
      .select();
    return { data, error };
  },

  deleteById: async (table, id) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    return { error };
  },

  // --- Profile ---
  getProfileById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  upsertProfile: async (profile) => {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile);
    return { error };
  },

  clearAllData: async () => {
    // Note: Cloud sync doesn't support bulk deletion like this easily without complex queries.
    // Usually handled by deleting the user or specific items.
    console.warn('clearAllData not implemented for cloud sync');
    return { error: null };
  }
};

export default browserData;
