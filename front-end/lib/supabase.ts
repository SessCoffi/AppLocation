import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://TON_ID.supabase.co';
const supabaseAnonKey = 'TA_CLE_PUBLIQUE_ANON';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);