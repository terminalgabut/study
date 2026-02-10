import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sesuaikan daftar tabel (Gunakan 'profile' tanpa S jika itu nama tabelmu)
const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts', 'profile'];

export const supabase = {
  ...client, // Tetap mengekspor rpc, auth, dll
  from: (tableName) => {
    const originalFrom = client.from(tableName);
    if (!privateTables.includes(tableName)) return originalFrom;

    // Ambil fungsi asli
    const originalSelect = originalFrom.select.bind(originalFrom);
    const originalInsert = originalFrom.insert.bind(originalFrom);
    const originalUpsert = originalFrom.upsert.bind(originalFrom);

    return {
      ...originalFrom,
      // Wrapper SELECT untuk filter user_id otomatis
      select: function(columns) {
        const query = originalSelect(columns);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          const { data: { user } } = await client.auth.getUser();
          if (user) {
            const filterCol = tableName === 'profile' ? 'id' : 'user_id';
            query.eq(filterCol, user.id);
          }
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },
      // Wrapper INSERT untuk tambah user_id otomatis
      insert: async function(values, options) {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Auth required' } };
        const data = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
        return originalInsert(data, options);
      },
      // Wrapper UPSERT untuk tambah user_id otomatis
      upsert: async function(values, options) {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Auth required' } };
        const data = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
        return originalUpsert(data, options);
      }
    };
  }
};
