// services/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

// 1. Client asli (internal)
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Daftar tabel yang butuh filter user_id otomatis
const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts'];

// 3. Modifikasi objek supabase sebelum di-export
export const supabase = {
  ...client,
  from: (tableName) => {
    const originalFrom = client.from(tableName);

    // Jika tabel materi atau tabel umum lainnya, biarkan normal
    if (!privateTables.includes(tableName)) return originalFrom;

    // Jika tabel privat, kita "bajak" fungsi select, insert, dan upsert-nya
    return {
      ...originalFrom,
      select: function(columns) {
        // Logika: Ambil query asli, lalu sisipkan filter di tengah jalan
        const query = originalFrom.select(columns);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          const { data: { user } } = await client.auth.getUser();
          if (user) query.eq('user_id', user.id); // OTOMATIS FILTER
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },
      insert: async (values, options) => {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Silahkan login dahulu' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.insert(dataWithUser, options);
      },
      upsert: async (values, options) => {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Silahkan login dahulu' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.upsert(dataWithUser, options);
      }
    };
  }
};
