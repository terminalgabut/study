// js/services/materiProfileService.js

import { supabase } from './supabase.js';

const INVALID_CATEGORIES = ['redirect', 'materi'];

export async function getMateriProfileSummary() {
  const { data, error } = await supabase
    .from('study_progress')
    .select(`
      category,
      bab_title,
      read_count,
      attempts_count,
      total_score_points,
      total_reading_seconds,
      total_quiz_seconds,
      updated_at
    `)
    .not('category', 'in', `(${INVALID_CATEGORIES.map(c => `"${c}"`).join(',')})`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Materi summary error:', error);
    return [];
  }

  return (data ?? []).map((row) => {
    const attempts = Number(row.attempts_count) || 0;
    const totalPoints = Number(row.total_score_points) || 0;
    const readCount = Number(row.read_count) || 0;
    const readingSeconds = Number(row.total_reading_seconds) || 0;
    const quizSeconds = Number(row.total_quiz_seconds) || 0;

    // ===== WINRATE =====
    const winrate =
      attempts > 0
        ? Math.round((totalPoints / attempts) * 100)
        : 0;

    // ===== TOTAL READING HOURS (2 decimal precision) =====
    const totalReadingHours =
      Number((readingSeconds / 3600).toFixed(2));

    // ===== AVG SPEED (seconds per question) =====
    const avgSpeed =
      attempts > 0
        ? Number((quizSeconds / attempts).toFixed(2))
        : 0;

    return {
      category: row.category ?? '-',
      judul: row.bab_title ?? '-',
      dibaca: readCount,
      total_baca_jam: totalReadingHours,
      soal_dikerjakan: attempts,
      winrate,
      avg_speed: avgSpeed
    };
  });
}
