// services/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Konsisten gunakan 'profile' tanpa 's' sesuai permintaanmu
const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts', 'profile'];

export const supabase = {
  ...client, // Ini menyalin rpc, auth, dll
  from: (tableName) => {
    const originalFrom = client.from(tableName);
    if (!privateTables.includes(tableName)) return originalFrom;

    return {
      ...originalFrom,
      select: function(columns) {
        const query = originalFrom.select(columns);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          const { data: { user } } = await client.auth.getUser();
          // Jika tabel profile, gunakan kolom 'id'
          const filterColumn = tableName === 'profile' ? 'id' : 'user_id';
          if (user) query.eq(filterColumn, user.id); 
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      }
      // Tambahkan insert, update, delete jika perlu dengan pola yang sama
    };
  }
};
