import { supabase } from './supabase.js';

export const performaService = {
  async getDashboardData() {
    const [
      profileRes,
      attemptsRes,
      historyRes,
      achievementRes
    ] = await Promise.all([
      supabase.from('profiles').select('*').single(),

      // ✅ JOIN KE MATERI
      supabase
        .from('study_attempts')
        .select('*, materi(title)')
        .order('submitted_at', { ascending: true }),

      supabase.from('riwayat').select('*, materi(title)'),

      supabase.from('user_achievements').select('*, achievements(*)')
    ]);

    if (profileRes.error) console.warn('Profile belum ada');
    if (attemptsRes.error) throw attemptsRes.error;
    if (historyRes.error) throw historyRes.error;
    if (achievementRes.error) throw achievementRes.error;

    const attempts = attemptsRes.data ?? [];
    const history = historyRes.data ?? [];

    return {
      profile: profileRes.data,
      attempts,
      history,
      achievements: achievementRes.data ?? [],
      stats: this.calculateStats(attempts, history)
    };
  },

  calculateStats(attempts = [], history = []) {
    /* =============================
       1. TOTAL MATERI & WAKTU
    ============================== */
    const totalMateri = history.length;

    const totalSeconds = history.reduce(
      (acc, h) => acc + (h.duration_seconds || 0),
      0
    );

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

    /* =============================
       2. RATA-RATA SKOR
    ============================== */
    const totalScore = attempts.reduce(
      (acc, a) => acc + (a.score || 0),
      0
    );

    const avgScore =
      attempts.length > 0
        ? Math.round(totalScore / attempts.length)
        : 0;

    /* =============================
       3. PETA KEKUATAN (REAL DATA)
       → dari judul materi
    ============================== */
    const categoryMap = {};

    attempts.forEach(att => {
      const title = att.materi?.title || 'Umum';
      const category = title.split(' ')[0]; // 🔥 INTI PERBAIKAN

      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, count: 0 };
      }

      categoryMap[category].total += att.score || 0;
      categoryMap[category].count += 1;
    });

    const categoryData = {
      labels: Object.keys(categoryMap),
      scores: Object.values(categoryMap).map(c =>
        Math.round(c.total / c.count)
      )
    };

    /* =============================
       4. STREAK (AMAN & REAL)
    ============================== */
    let streak = 0;

    if (attempts.length > 0) {
      const dateSet = new Set(
        attempts.map(a => a.submitted_at.split('T')[0])
      );

      let day = new Date();

      while (true) {
        const key = day.toISOString().split('T')[0];
        if (dateSet.has(key)) {
          streak++;
          day.setDate(day.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      totalMateri,
      timeString,
      avgScore,
      streak,
      categoryData
    };
  }
};
