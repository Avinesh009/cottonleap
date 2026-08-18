// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || supabaseUrl.includes('placeholder.supabase.co')) {
  console.warn(
    '⚠️ Supabase VITE_SUPABASE_URL is not set or is using the placeholder. ' +
    'Please configure your environment variables in the .env file.'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder_anon_key') {
  console.warn(
    '⚠️ Supabase VITE_SUPABASE_ANON_KEY is not set or is using the placeholder. ' +
    'Please configure your environment variables in the .env file.'
  );
}

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
