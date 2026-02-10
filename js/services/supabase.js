import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tabel yang memerlukan filter user_id otomatis
const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts', 'profile'];

export const supabase = {
  rpc: client.rpc.bind(client),
  auth: client.auth,
  storage: client.storage,
  
  from: (tableName) => {
    const originalFrom = client.from(tableName);
    
    // Jika tabel publik (seperti 'materials'), gunakan fungsi asli tanpa bungkus
    if (!privateTables.includes(tableName)) return originalFrom;

    // Jika tabel privat, bungkus fungsinya untuk menyisipkan user_id otomatis
    return {
      ...originalFrom, // Salin semua fungsi asli (penting!)

      // Wrapper SELECT
      select: function(columns) {
        window.__DEBUG__.log(`[DB] SELECT: ${tableName}`);
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

      // Wrapper INSERT
      insert: async function(values, options) {
        window.__DEBUG__.log(`[DB] INSERT: ${tableName}`);
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.insert(dataWithUser, options);
      },

      // Wrapper UPSERT (Perbaikan Error Kamu)
      // Di dalam wrapper from: (tableName) => { ... } di supabase.js
upsert: async function(values, options) {
  window.__DEBUG__.log(`[DB] UPSERT: ${tableName}`);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    window.__DEBUG__.error("Upsert Gagal: User tidak ditemukan dalam sesi.");
    return { error: { message: 'Login diperlukan' } };
  }

  // Pastikan user_id disuntikkan ke dalam data
  const dataToSave = Array.isArray(values) 
    ? values.map(v => ({ ...v, user_id: user.id }))
    : { ...values, user_id: user.id };

  window.__DEBUG__.log("Data yang akan disimpan:", dataToSave);
  
  return originalFrom.upsert(dataToSave, options);
},

      // Wrapper DELETE
      delete: function(options) {
        window.__DEBUG__.log(`[DB] DELETE: ${tableName}`);
        const query = originalFrom.delete(options);
        const originalThen = query.then.bind(query);
        query.then = async (onfulfilled, onrejected) => {
          const { data: { user } } = await client.auth.getUser();
          if (user) query.eq('user_id', user.id);
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },

      // Wrapper UPDATE
      update: function(values, options) {
        window.__DEBUG__.log(`[DB] UPDATE: ${tableName}`);
        const query = originalFrom.update(values, options);
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
