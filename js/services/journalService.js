// root/js/services/journalService.js

// js/services/journalService.js

import { supabase } from './supabase.js'

export async function getWeeklySnapshots(userId) {
  const { data, error } = await supabase
    .from('weekly_journal_snapshot')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })

  if (error) {
    console.error('getWeeklySnapshots error:', error)
    return []
  }

  return data || []
}

async function generateWeeklySnapshot(userId, startDate, endDate) {

  // 1️⃣ Ambil attempt minggu ini
  const { data: attempts } = await supabase
    .from('study_attempts')
    .select('score, duration_seconds, title, category')
    .eq('user_id', userId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString());

  // 2️⃣ Ambil learning sessions minggu ini
  const { data: sessions } = await supabase
    .from('learning_sessions')
    .select('reading_seconds, quiz_seconds')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // =====================
  // CALCULATION
  // =====================

  const totalQuizAttempts = attempts.length;

  const totalQuizScore = attempts.reduce(
    (acc, a) => acc + (Number(a.score) || 0),
    0
  );

  const avgScore =
    totalQuizAttempts > 0
      ? Math.round((totalQuizScore / totalQuizAttempts) * 100)
      : 0;

  const totalReadingSeconds = sessions.reduce(
    (acc, s) => acc + (Number(s.reading_seconds) || 0),
    0
  );

  const totalQuizSeconds = sessions.reduce(
    (acc, s) => acc + (Number(s.quiz_seconds) || 0),
    0
  );

  const totalStudySeconds =
    totalReadingSeconds + totalQuizSeconds;

  // =====================
  // MOST ACTIVE CATEGORY
  // =====================

  const categoryCount = {};

  attempts.forEach(a => {
    if (!a.category) return;
    categoryCount[a.category] =
      (categoryCount[a.category] || 0) + 1;
  });

  const mostActiveCategory =
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // =====================
  // SAVE SNAPSHOT
  // =====================

  await supabase
    .from('weekly_journal_snapshot')
    .upsert({
      user_id: userId,
      week_start: startDate,
      week_end: endDate,
      total_quiz_attempts: totalQuizAttempts,
      total_quiz_score: totalQuizScore,
      avg_score: avgScore,
      total_reading_seconds: totalReadingSeconds,
      total_quiz_seconds: totalQuizSeconds,
      total_study_seconds: totalStudySeconds,
      most_active_category: mostActiveCategory
    }, {
      onConflict: 'user_id,week_start'
    });

}
