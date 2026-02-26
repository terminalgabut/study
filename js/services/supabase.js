import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://gmmhsbmlqbomtrhdoxxo.supabase.co',
  'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
