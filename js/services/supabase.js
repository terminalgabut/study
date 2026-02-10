import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts', 'profile'];

export const supabase = {
  rpc: client.rpc.bind(client),
  auth: client.auth,
  storage: client.storage,
  
  from: (tableName) => {
    const originalFrom = client.from(tableName);
    
    // Jika tabel publik, langsung kembalikan fungsi asli
    if (!privateTables.includes(tableName)) return originalFrom;

    // Jika tabel privat, bungkus fungsinya
    return {
      ...originalFrom,
      
      // 1. SELECT dengan Auto-Filter User
      select: function(columns) {
        window.__DEBUG__.log(`DB_SELECT: ${tableName}`);
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
            window.__DEBUG__.error(`Filter Error [${tableName}]:`, e);
          }
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },

      // 2. INSERT dengan Auto User ID
      insert: async function(values, options) {
        window.__DEBUG__.log(`DB_INSERT: ${tableName}`);
        const { data: { user } } = await client.auth.getUser();
        if (!user) {
           window.__DEBUG__.warn('DB_INSERT Gagal: User tidak login');
           return { error: { message: 'Login diperlukan' } };
        }
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.insert(dataWithUser, options);
      },

      // 3. UPSERT dengan Auto User ID
      upsert: async function(values, options) {
        window.__DEBUG__.log(`DB_UPSERT: ${tableName}`);
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.upsert(dataWithUser, options);
      },

      // 4. DELETE (Wajib ditambahkan manual agar tidak hilang saat dibungkus)
      delete: function() {
        window.__DEBUG__.log(`DB_DELETE: ${tableName}`);
        const query = originalFrom.delete();
        
        // Tambahkan filter otomatis agar user hanya bisa hapus miliknya sendiri
        const originalThen = query.then.bind(query);
        query.then = async (onfulfilled, onrejected) => {
          const { data: { user } } = await client.auth.getUser();
          if (user) query.eq('user_id', user.id);
          return originalThen(onfulfilled, onrejected);
        };
        
        return query;
      },

      // 5. UPDATE
      update: function(values) {
        window.__DEBUG__.log(`DB_UPDATE: ${tableName}`);
        const query = originalFrom.update(values);
        
        const originalThen = query.then.bind(query);
        query.then = async (onfulfilled, onrejected) => {
          const { data: { user } } = await client.auth.getUser();
          if (user) query.eq('user_id', user.id);
          return originalThen(onfulfilled, onrejected);
        };
        
        return query;
      }
    };
  }
};
