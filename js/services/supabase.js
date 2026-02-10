// js/services/supabase.js

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
    
    if (!privateTables.includes(tableName)) return originalFrom;

    // Wrapper untuk tabel privat agar otomatis filter user_id
    return {
      // Kita ambil semua properti asli dari Supabase
      ...originalFrom,

      // Override SELECT
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
            window.__DEBUG__.error('Select Wrapper Error:', e);
          }
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },

      // Override INSERT
      insert: async function(values, options) {
        window.__DEBUG__.log(`[DB] INSERT: ${tableName}`);
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.insert(dataWithUser, options);
      },

      // Override DELETE (Penyebab Error Utamanya di sini)
      delete: function(options) {
        window.__DEBUG__.log(`[DB] DELETE: ${tableName}`);
        const query = originalFrom.delete(options);
        
        // Tambahkan filter otomatis agar user hanya bisa hapus miliknya sendiri
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

      // Override UPDATE
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
