import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Konsisten: Gunakan 'profile' (tanpa s) sesuai nama tabelmu
const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts', 'profile'];

export const supabase = {
  // 1. Ambil fungsi RPC dan lainnya dengan BIND agar konteks 'this' tidak hilang
  rpc: client.rpc.bind(client),
  auth: client.auth,
  storage: client.storage,
  
  // 2. Bungkus fungsi FROM
  from: (tableName) => {
    const originalFrom = client.from(tableName);
    
    // Jika tabel publik, langsung kembalikan fungsi asli
    if (!privateTables.includes(tableName)) return originalFrom;

    // Jika tabel privat, bungkus fungsinya
    return {
      ...originalFrom,
      
      // Wrapper SELECT: Otomatis tambah filter user_id/id
      select: function(columns) {
        const query = originalFrom.select(columns);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          try {
            const { data: { user } } = await client.auth.getUser();
            if (user) {
              const filterCol = tableName === 'profile' ? 'id' : 'user_id';
              query.eq(filterCol, user.id);
            }
          } catch (e) {
            console.error("Filter Error:", e);
          }
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },

      // Wrapper INSERT: Otomatis tempel user_id
      insert: async function(values, options) {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.insert(dataWithUser, options);
      },

      // Wrapper UPSERT: Otomatis tempel user_id
      upsert: async function(values, options) {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.upsert(dataWithUser, options);
      }
    };
  }
};
