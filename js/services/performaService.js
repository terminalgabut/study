import { supabase } from './supabase.js';

export const performaService = {
  async getDashboardData() {
    window.__DEBUG__.log("--- [DEBUG] Fetching Dashboard Data ---");

    const [profileRes, progressRes, achievementRes] = await Promise.all([
      // 1. Ambil data profil (untuk XP/Level global jika masih pakai tabel profile)
      supabase.from('profiles').select('*').single(), 
      
      // 2. Ambil data akumulasi dari tabel baru kita
      supabase.from('study_progress').select('*').order('updated_at', { ascending: false }),

      // 3. Ambil lencana yang sudah diraih
      supabase.from('user_achievements').select('*, achievements(*)').order('earned_at', { ascending: false })
    ]);

    // Debugging Response
    if (progressRes.error) {
      window.__DEBUG__.error("[Service] Gagal ambil study_progress:", progressRes.error.message);
    } else {
      window.__DEBUG__.log(`[Service] Berhasil ambil ${progressRes.data.length} baris progres.`);
    }

    const progress = progressRes.data ?? [];
    const achievements = achievementRes.data ?? [];

    return {
      profile: profileRes.data,
      progress: progress,
      achievements: achievements,
      // Kita tetap kembalikan objek stats agar controller tidak pecah, 
      // tapi isinya kita ambil langsung dari data progress
      stats: this.calculateStatsFromProgress(progress)
    };
  },

  /**
   * Menghitung statistik sederhana dari data agregat study_progress
   */
  calculateStatsFromProgress(progress = []) {
    window.__DEBUG__.log("[Service] Calculating stats dari data agregat...");

    const totalMateri = progress.length;
    
    // Total waktu gabungan membaca dan kuis (dalam detik)
    const totalSeconds = progress.reduce(
      (acc, p) => acc + (Number(p.total_reading_seconds || 0) + Number(p.total_quiz_seconds || 0)),
      0
    );

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

    // Akurasi Total (Total Poin / Total Soal yang Pernah Dijawab)
    const totalPoints = progress.reduce((acc, p) => acc + (p.total_score_points || 0), 0);
    const totalAttempts = progress.reduce((acc, p) => acc + (p.attempts_count || 0), 0);
    const avgScore = totalAttempts > 0 ? Math.round((totalPoints / totalAttempts) * 100) : 0;

    // Streak (Sederhana: Cek update terakhir di study_progress)
    let streak = 0;
    if (progress.length > 0) {
        const dates = progress.map(p => p.updated_at.split('T')[0]);
        const uniqueDates = [...new Set(dates)].sort().reverse();
        
        let today = new Date().toISOString().split('T')[0];
        // Logika streak sederhana berdasarkan keteraturan tanggal update
        streak = uniqueDates.length; // Contoh: jumlah hari unik aktif
    }

    return {
      totalMateri,
      timeString,
      avgScore,
      streak,
      totalPoints // Kita tambahkan ini untuk level
    };
  }
};
