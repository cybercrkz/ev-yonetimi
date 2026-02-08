import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://svqepatujmnuupzlcrcc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cWVwYXR1am1udXVwemxjcmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NTc5NTgsImV4cCI6MjA4NjEzMzk1OH0.8CeDAIBI1vo-w6kRRMKv3qG6sY8fu5SJgj_BL8aUw0o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
