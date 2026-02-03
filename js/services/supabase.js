// supabase.js
import { createClient } from '@supabase/supabase-js'

// 🔑 Ganti dengan info Supabase project-mu
const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH'

// buat client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
