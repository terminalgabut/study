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

    return {
      ...originalFrom,

      // 1. SELECT
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
          } catch (e) { window.__DEBUG__.error('Select Error:', e); }
          return originalThen(onfulfilled, onrejected);
        };
        return query;
      },

      // 2. INSERT
      insert: async function(values, options) {
        window.__DEBUG__.log(`[DB] INSERT: ${tableName}`);
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
        return originalFrom.insert(dataWithUser, options);
      },

      // 3. UPSERT (INI PERBAIKANNYA)
      upsert: async function(values, options) {
        window.__DEBUG__.log(`[DB] UPSERT: ${tableName}`);
        const { data: { user } } = await client.auth.getUser();
        if (!user) return { error: { message: 'Login diperlukan' } };
        
        // Pastikan user_id masuk ke data agar tidak melanggar RLS
        const dataWithUser = Array.isArray(values) 
          ? values.map(v => ({ ...v, user_id: user.id }))
          : { ...values, user_id: user.id };
          
        return originalFrom.upsert(dataWithUser, options);
      },

      // 4. DELETE
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

      // 5. UPDATE
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
