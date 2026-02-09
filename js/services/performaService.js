import { supabase } from './supabase.js'; // Sesuaikan path-nya

export const performaService = {
  async getDashboardData() {
    // Karena wrapper kamu sudah otomatis memfilter berdasarkan user login,
    // kita cukup panggil select() saja.
    
    const [profileRes, attemptsRes, historyRes, achievementRes] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('study_attempts').select('*').order('submitted_at', { ascending: true }),
      supabase.from('riwayat').select('*, materi(title, category)'),
      supabase.from('user_achievements').select('*, achievements(*)') 
    ]);

    // Handle Error
    if (profileRes.error) console.warn("Profile belum diset");

    const attempts = attemptsRes.data || [];
    const history = historyRes.data || [];

    return {
      profile: profileRes.data,
      attempts: attempts,
      history: history,
      achievements: achievementRes.data || [],
      stats: this.calculateStats(attempts, history)
    };
  },

  calculateStats(attempts, history) {
    // 1. Total Materi Selesai
    const totalMateri = history.length;

    // 2. Investasi Waktu (Konversi detik ke format Jam & Menit)
    const totalSeconds = history.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

    // 3. Rata-rata Skor
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

    // 4. Streak (Logika Berdasarkan submitted_at di study_attempts atau riwayat)
    const streak = this.calculateStreak(attempts);

    return { totalMateri, timeString, avgScore, streak };
  },

  calculateStreak(attempts) {
    if (attempts.length === 0) return 0;
    // Logika streak sederhana bisa dikembangkan di sini
    return 1; 
  }
};
