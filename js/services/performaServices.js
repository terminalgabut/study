// root/js/services/performaServices.js

import { supabase } from './supabase.js';

export const performaService = {

  async getDashboardData(startDate = null, endDate = null) {
    window.__DEBUG__?.log('[Service] Fetch dashboard');

    try {
      let progressQuery = supabase
        .from('study_progress')
        .select(`
          updated_at,
          total_score_points,
          attempts_count,
          read_count,
          total_reading_seconds,
          total_quiz_seconds
        `)
        .order('updated_at', { ascending: false });

      if (startDate && endDate) {
        progressQuery = progressQuery
          .gte('updated_at', startDate.toISOString())
          .lte('updated_at', endDate.toISOString());

        window.__DEBUG__?.log(
          `[Service] Filter: ${startDate.toDateString()} → ${endDate.toDateString()}`
        );
      }

      const [
        { data: profile },
        { data: progress, error: progressErr },
        { data: achievements }
      ] = await Promise.all([
        supabase.from('profile').select('full_name, xp').maybeSingle(),
        progressQuery,
        supabase
          .from('user_achievements')
          .select('earned_at, achievements(name, icon)')
          .order('earned_at', { ascending: false })
      ]);

      if (progressErr) throw progressErr;

      return {
        profile: profile || { full_name: 'Pelajar', xp: 0 },
        progress,
        achievements: achievements || [],
        stats: this.calculateStatsFromProgress(progress)
      };

    } catch (err) {
      window.__DEBUG__?.error('[Service] Dashboard error:', err);
      throw err;
    }
  },

  async getLearningSessions() {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('created_at, reading_seconds, quiz_seconds')
      .order('created_at', { ascending: true });

    if (error) {
      window.__DEBUG__?.error('[Service] sessions error:', error);
      return [];
    }

    return data;
  },

  calculateStatsFromProgress(rows = []) {
    let totalPoints = 0;
    let totalAttempts = 0;
    let totalReadCount = 0;
    let totalSeconds = 0;

    for (const p of rows) {
      totalPoints += p.total_score_points || 0;
      totalAttempts += p.attempts_count || 0;
      totalReadCount += p.read_count || 0;
      totalSeconds +=
        (Number(p.total_reading_seconds) || 0) +
        (Number(p.total_quiz_seconds) || 0);
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return {
      totalMateri: rows.length,
      timeString: hours ? `${hours}j ${minutes}m` : `${minutes}m`,
      totalPoints,
      avgScore: totalAttempts
        ? Math.round((totalPoints / totalAttempts) * 100)
        : 0,
      totalReadCount,
      streak: rows.length ? 1 : 0
    };
  }
};
