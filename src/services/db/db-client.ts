/**
 * Supabase Client
 * 
 * This file initializes and exports the Supabase client for database operations.
 * It provides a consistent interface for interacting with the Supabase backend.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
// If not available, use default values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Export default for convenience
export default supabase;
