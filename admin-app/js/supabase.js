// ============================================================
// SHOWPAY 2.0 — ADMIN SUPABASE CLIENT (same project)
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ujzupmmvfrhpwziudydr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zqGOuDGYCAin5goXvlM5-Q_pliMNwlj';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export default supabase;
