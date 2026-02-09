import { supabase } from './supabase.js'; 

export const performaService = {
  async getDashboardData() {
    const [profileRes, attemptsRes, historyRes, achievementRes] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('study_attempts').select('*').order('submitted_at', { ascending: true }),
      supabase.from('riwayat').select('*, materi(title, category)'),
      supabase.from('user_achievements').select('*, achievements(*)') 
    ]);

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
    const totalMateri = history.length;
    const totalSeconds = history.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

    const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

    return { totalMateri, timeString, avgScore, streak: attempts.length > 0 ? 1 : 0 };
  }
};
