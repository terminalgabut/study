import { supabase } from './supabase.js';

export const performaService = {
  async getDashboardData() {
    window.__DEBUG__.log("--- [DEBUG] Fetching Dashboard Data ---");

    const [profileRes, progressRes, achievementRes] = await Promise.all([
      // 1. Ambil data profil (untuk XP/Level global jika masih pakai tabel profile)
      supabase.from('profile').select('*').single(), 
      
      // 2. Ambil data akumulasi dari tabel baru kita
      supabase.from('study_progress').select('*').order('updated_at', { ascending: false }),
import { supabase } from './supabase.js';

export const performaService = {
  async getDashboardData() {
    window.__DEBUG__.log("--- [DEBUG] Fetching Dashboard Data (Agregat Mode) ---");

    try {
      // Kita hanya ambil data dari sumber yang 'Reliable' (Permanen)
      const [profileRes, progressRes, achievementRes] = await Promise.all([
        supabase.from('profile').select('*').maybeSingle(), 
        supabase.from('study_progress').select('*').order('updated_at', { ascending: false }),
        supabase.from('user_achievements').select('*, achievements(*)').order('earned_at', { ascending: false })
      ]);

      // 1. Debug Profil
      if (profileRes.error) {
        window.__DEBUG__.warn("[Service] Profile tidak ditemukan:", profileRes.error.message);
      }

      // 2. Handle Error Progress (Ini jantungnya halaman performa)
      if (progressRes.error) {
        window.__DEBUG__.error("[Service] Gagal ambil study_progress:", progressRes.error.message);
        throw progressRes.error; 
      }

      const progress = progressRes.data ?? [];
      const achievements = achievementRes.data ?? [];

      window.__DEBUG__.log(`[Service] Load Berhasil: ${progress.length} Bab ditemukan.`);

      return {
        profile: profileRes.data || { full_name: 'Pelajar', xp: 0 },
        progress: progress, // Data ini sudah mengandung Judul Bab & Kategori
        achievements: achievements,
        stats: this.calculateStatsFromProgress(progress)
      };
    } catch (err) {
      window.__DEBUG__.error("[Service] Critical Error:", err.message);
      throw err;
    }
  },

  calculateStatsFromProgress(progress = []) {
  const totalMateri = progress.length;
  const totalPoints = progress.reduce((acc, p) => acc + (p.total_score_points || 0), 0);
  const totalAttempts = progress.reduce((acc, p) => acc + (p.attempts_count || 0), 0);
  
  // Hitung total repetisi (Materi Diulang)
  const totalReadCount = progress.reduce((acc, p) => acc + (p.read_count || 0), 0);
  
  const totalSeconds = progress.reduce(
    (acc, p) => acc + (Number(p.total_reading_seconds || 0) + Number(p.total_quiz_seconds || 0)),
    0
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

  return { 
    totalMateri, 
    timeString, 
    avgScore: totalAttempts > 0 ? Math.round((totalPoints / totalAttempts) * 100) : 0, 
    totalPoints,
    totalReadCount, // Ditambahkan agar controller tinggal pakai
    streak: progress.length > 0 ? 1 : 0 
  };
}
};
