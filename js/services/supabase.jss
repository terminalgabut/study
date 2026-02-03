// services/supabase.js
// Import Supabase ESM langsung dari CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

// Buat client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
