// root/js/service/performaServices.js

import { supabase } from './supabase.js';

export const performaService = {
  async getDashboardData(startDate = null, endDate = null) {
    window.__DEBUG__.log("--- [DEBUG] Fetching Dashboard Data (Agregat Mode) ---");

    try {
      // 1. Siapkan query untuk study_progress
      let progressQuery = supabase
        .from('study_progress')
        .select('*')
        .order('updated_at', { ascending: false });

      // 2. INJEKSI FILTER TANGGAL (Jika ada input dari kalender)
      if (startDate && endDate) {
        // Gunakan toISOString() untuk format yang dimengerti Supabase
        progressQuery = progressQuery
          .gte('updated_at', startDate.toISOString())
          .lte('updated_at', endDate.toISOString());
          
        window.__DEBUG__.log(`[Service] Memfilter data: ${startDate.toDateString()} s/d ${endDate.toDateString()}`);
      }
      // Mengambil data dari tabel permanen (bukan riwayat sementara)
      const [profileRes, progressRes, achievementRes] = await Promise.all([
        supabase.from('profile').select('*').maybeSingle(), 
        progressQuery, 
        supabase.from('user_achievements').select('*, achievements(*)').order('earned_at', { ascending: false })
      ]);

      // Logging untuk mempermudah pelacakan jika data kosong
      if (profileRes.error) {
        window.__DEBUG__.warn("[Service] Profile tidak ditemukan:", profileRes.error.message);
      }

      if (progressRes.error) {
        window.__DEBUG__.error("[Service] Gagal ambil study_progress:", progressRes.error.message);
        throw progressRes.error; 
      }

      const progress = progressRes.data ?? [];
      const achievements = achievementRes.data ?? [];

      window.__DEBUG__.log(`[Service] Load Berhasil: ${progress.length} Bab ditemukan.`);

      return {
        profile: profileRes.data || { full_name: 'Pelajar', xp: 0 },
        progress: progress, 
        achievements: achievements,
        stats: this.calculateStatsFromProgress(progress) // Mengirim hasil kalkulasi ke Controller
      };
    } catch (err) {
      window.__DEBUG__.error("[Service] Critical Error:", err.message);
      throw err;
    }
  },

  async getLearningSessions() {
    window.__DEBUG__.log("[Service] Fetching Learning Sessions...");
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      window.__DEBUG__.error("[Service] Gagal ambil sesi:", error.message);
      return [];
    }
    return data;
  },

  calculateStatsFromProgress(progress = []) {
    // 1. Hitung akumulasi dasar
    const totalMateri = progress.length;
    const totalPoints = progress.reduce((acc, p) => acc + (p.total_score_points || 0), 0);
    const totalAttempts = progress.reduce((acc, p) => acc + (p.attempts_count || 0), 0);
    const totalReadCount = progress.reduce((acc, p) => acc + (p.read_count || 0), 0);
    
    // 2. Hitung total durasi (Membaca + Kuis)
    const totalSeconds = progress.reduce(
      (acc, p) => acc + (Number(p.total_reading_seconds || 0) + Number(p.total_quiz_seconds || 0)),
      0
    );

    // 3. Konversi format waktu
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

    return { 
      totalMateri, 
      timeString, 
      // Akurasi: (Benar/Total Soal) * 100
      avgScore: totalAttempts > 0 ? Math.round((totalPoints / totalAttempts) * 100) : 0, 
      totalPoints,
      totalReadCount,
      streak: progress.length > 0 ? 1 : 0 
    };
  }
};
