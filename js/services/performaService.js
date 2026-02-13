// root/js/service/performaServices.js

import { supabase } from './supabase.js';

export const performaService = {
  async getDashboardData(startDate = null, endDate = null) {
    window.__DEBUG__.log("--- [DEBUG] Fetching Dashboard Data (Agregat Mode) ---");

    try {
      // 1. Query untuk STATISTIK TOTAL (Selalu ambil semua tanpa filter tanggal)
      const allDataQuery = supabase
        .from('study_progress')
        .select('*');

      let filteredQuery = supabase
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
      const [profileRes, allProgressRes, filteredRes, achievementRes] = await Promise.all([
        supabase.from('profile').select('*').maybeSingle(), 
        allDataQuery,    // Data untuk kartu statistik (Total)
        filteredQuery,   // Data untuk Chart & Jurnal (Terfilter)
        supabase.from('user_achievements').select('*, achievements(*)').order('earned_at', { ascending: false })
      ]);
      
      // Logging untuk mempermudah pelacakan jika data kosong
      if (profileRes.error) {
        window.__DEBUG__.warn("[Service] Profile tidak ditemukan:", profileRes.error.message);
      }

      if (allProgressRes.error) throw allProgressRes.error;
      if (filteredRes.error) throw filteredRes.error;

      const allProgress = allProgressRes.data ?? [];
      const filteredProgress = filteredRes.data ?? [];
      const achievements = achievementRes.data ?? [];

      window.__DEBUG__.log(`[Service] Load Berhasil. Total: ${allProgress.length} bab, Terfilter: ${filteredProgress.length} bab.`);

      return {
        profile: profileRes.data || { full_name: 'Pelajar', xp: 0 },
        progress: filteredProgress, // Kirim data terfilter ke Chart & Jurnal
        achievements: achievements,
        // PERBAIKAN: Kirim allProgress agar fungsi kalkulator mengenalinya
        stats: this.calculateStatsFromProgress(allProgress) 
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
      .select('created_at, duration_seconds')
      .order('created_at', { ascending: true });

    if (error) {
      window.__DEBUG__.error("[Service] Gagal ambil sesi:", error.message);
      return [];
    }
    return data;
  },

  calculateStatsFromProgress(allProgress = []) { // GANTI progress -> allProgress di sini
    // 1. Hitung akumulasi dasar menggunakan allProgress
    const totalMateri = allProgress.length;
    const totalPoints = allProgress.reduce((acc, p) => acc + (p.total_score_points || 0), 0);
    const totalAttempts = allProgress.reduce((acc, p) => acc + (p.attempts_count || 0), 0);
    const totalReadCount = allProgress.reduce((acc, p) => acc + (p.read_count || 0), 0);
    
    // 2. Hitung total durasi
    const totalSeconds = allProgress.reduce(
      (acc, p) => acc + (Number(p.total_reading_seconds || 0) + Number(p.total_quiz_seconds || 0)),
      0
    );

    // 3. Konversi format waktu secara dinamis
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let timeString = "";
    if (hours > 0) {
        timeString = minutes > 0 ? `${hours}j ${minutes}m` : `${hours}j`;
    } else {
        timeString = `${minutes}m`;
    }

    return {
      totalMateri, 
      timeString,
      totalPoints, // Gunakan variabel yang sudah dihitung di poin 1
      avgScore: totalAttempts > 0 ? Math.round((totalPoints / totalAttempts) * 100) : 0, 
      totalReadCount,
      streak: allProgress.length > 0 ? 1 : 0 
    };
}
};
