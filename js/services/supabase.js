// root/js/services/supabase.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Daftar tabel yang dimiliki user
 * - profile → pakai kolom `id`
 * - lainnya → pakai `user_id`
 */
const privateTables = [
  'profile',
  'bookmark',
  'catatan',
  'riwayat',
  'study_attempts'
];

/**
 * Helper: tentukan kolom ownership
 */
function getOwnerColumn(tableName) {
  return tableName === 'profile' ? 'id' : 'user_id';
}

export const supabase = {
  // expose API asli
  auth: client.auth,
  rpc: client.rpc.bind(client),
  storage: client.storage,

  from(tableName) {
    const originalFrom = client.from(tableName);

    // tabel publik → langsung pakai supabase asli
    if (!privateTables.includes(tableName)) {
      return originalFrom;
    }

    const ownerCol = getOwnerColumn(tableName);

    return {
      ...originalFrom,

      /**
       * SELECT → auto filter berdasarkan user
       */
      select(columns, options) {
        window.__DEBUG__?.log(`[DB] SELECT ${tableName}`);

        const query = originalFrom.select(columns, options);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          try {
            const { data: { user } } = await client.auth.getUser();
            if (user) query.eq(ownerCol, user.id);
          } catch (e) {
            console.error(`[DB] SELECT filter error (${tableName})`, e);
          }
          return originalThen(onfulfilled, onrejected);
        };

        return query;
      },

      /**
       * INSERT → inject ownership
       */
      async insert(values, options) {
        window.__DEBUG__?.log(`[DB] INSERT ${tableName}`);

        const { data: { user } } = await client.auth.getUser();
        if (!user) {
          return { error: { message: 'Login diperlukan' } };
        }

        const withOwner = Array.isArray(values)
          ? values.map(v => ({
              ...v,
              [ownerCol]: user.id
            }))
          : {
              ...values,
              [ownerCol]: user.id
            };

        return originalFrom.insert(withOwner, options);
      },

      /**
       * UPSERT → inject ownership (FIXED)
       */
      async upsert(values, options) {
        window.__DEBUG__?.log(`[DB] UPSERT ${tableName}`);

        const { data: { user } } = await client.auth.getUser();
        if (!user) {
          return { error: { message: 'Login diperlukan' } };
        }

        const withOwner = Array.isArray(values)
          ? values.map(v => ({
              ...v,
              [ownerCol]: user.id
            }))
          : {
              ...values,
              [ownerCol]: user.id
            };

        return originalFrom.upsert(withOwner, options);
      },

      /**
       * UPDATE → auto filter by ownership
       */
      update(values, options) {
        window.__DEBUG__?.log(`[DB] UPDATE ${tableName}`);

        const query = originalFrom.update(values, options);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          try {
            const { data: { user } } = await client.auth.getUser();
            if (user) query.eq(ownerCol, user.id);
          } catch (e) {
            console.error(`[DB] UPDATE filter error (${tableName})`, e);
          }
          return originalThen(onfulfilled, onrejected);
        };

        return query;
      },

      /**
       * DELETE → auto filter by ownership
       */
      delete(options) {
        window.__DEBUG__?.log(`[DB] DELETE ${tableName}`);

        const query = originalFrom.delete(options);
        const originalThen = query.then.bind(query);

        query.then = async (onfulfilled, onrejected) => {
          try {
            const { data: { user } } = await client.auth.getUser();
            if (user) query.eq(ownerCol, user.id);
          } catch (e) {
            console.error(`[DB] DELETE filter error (${tableName})`, e);
          }
          return originalThen(onfulfilled, onrejected);
        };

        return query;
      }
    };
  }
};
