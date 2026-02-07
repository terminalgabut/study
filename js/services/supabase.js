// services/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://gmmhsbmlqbomtrhdoxxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_r0gMojctdN1aftj_PVuhAQ_R0s__keH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * HELPER OTOMATIS: Ambil Data Milik User
 * Digunakan di: notes.js, bookmark.js, riwayat.js, study_attempts.js
 */
export async function getMyData(tableName, selectQuery = '*') {
    // 1. Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'User not logged in' };

    // 2. Tambahkan filter user_id secara otomatis
    return await supabase
        .from(tableName)
        .select(selectQuery)
        .eq('user_id', user.id);
}

/**
 * HELPER OTOMATIS: Simpan Data dengan User ID
 * Otomatis menyisipkan user_id ke dalam data yang akan disimpan
 */
export async function saveMyData(tableName, payload) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not logged in' };

    // 3. Sisipkan user_id ke dalam objek data
    const dataWithUser = Array.isArray(payload) 
        ? payload.map(item => ({ ...item, user_id: user.id }))
        : { ...payload, user_id: user.id };

    return await supabase
        .from(tableName)
        .upsert(dataWithUser); // Menggunakan upsert agar otomatis update jika data ada
}
