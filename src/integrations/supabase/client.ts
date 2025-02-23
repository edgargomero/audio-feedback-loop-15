
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yoyeysyjptfzfysiwivv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveWV5c3lqcHRmemZ5c2l3aXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzU0MTYsImV4cCI6MjA1NTgxMTQxNn0.GWQ2B-TmOEA8b7TyuFcaiMTuLCw7UVy4bBsvO8ymosw";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Las credenciales de Supabase no están configuradas correctamente');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

