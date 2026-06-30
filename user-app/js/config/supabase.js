// ============================================================
// SHOWPAY 2.0 — SUPABASE CLIENT (Fixed: no top-level await)
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import ENV from './env.js';

const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

export default supabase;
