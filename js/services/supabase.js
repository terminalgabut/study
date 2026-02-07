// services/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

// 1. Client asli (internal)
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Daftar tabel yang butuh filter user_id otomatis
const privateTables = ['bookmark', 'catatan', 'riwayat', 'study_attempts', 'profiles'];

// 3. Modifikasi objek supabase sebelum di-export
export const supabase = {
  ...client,
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
          // Khusus tabel 'profiles', filter menggunakan 'id' bukan 'user_id'
          const filterColumn = tableName === 'profiles' ? 'id' : 'user_id';
          if (user) query.eq(filterColumn, user.id); 
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

/**
 * FUNGSI TAMBAHAN UNTUK STUDY ATTEMPTS & PROFIL
 */

// Menghitung statistik untuk halaman profil
export async function getStudyStats() {
  const { data, error } = await supabase
    .from('study_attempts')
    .select('score, is_correct, dimension');

  if (error) return { totalScore: 0, accuracy: 0, totalAttempts: 0 };

  const totalAttempts = data.length;
  const totalScore = data.reduce((sum, item) => sum + (item.score || 0), 0);
  const corrects = data.filter(item => item.is_correct).length;
  const accuracy = totalAttempts > 0 ? Math.round((corrects / totalAttempts) * 100) : 0;

  return { totalScore, accuracy, totalAttempts };
}

// Mencatat hasil kuis baru
export async function recordAttempt(attemptData) {
  // attemptData: { question_id, is_correct, score, user_answer, correct_answer, dimension, duration_seconds }
  return await supabase.from('study_attempts').insert([attemptData]);
}
