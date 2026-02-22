// js/services/materiProfileService.js

import { supabase } from './supabase.js';
import { buildStrengthProfile } from '../lib/strengthEngine.js';
import { buildStrengthNarrative } from '../lib/strengthNarrative.js';

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
      avg_time_per_question,
      avg_cognitive_index
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Materi summary error:', error);
    return [];
  }

  return (data || []).map(row => {

    const attempts = Number(row.attempts_count) || 0;
    const totalPoints = Number(row.total_score_points) || 0;

    const winrate = attempts > 0
      ? Math.round((totalPoints / attempts) * 100)
      : 0;

    const totalSeconds =
      (Number(row.total_reading_seconds) || 0) +
      (Number(row.total_quiz_seconds) || 0);

    const totalHours = (totalSeconds / 3600).toFixed(1);

    return {
      category: row.category,
      judul: row.bab_title,
      dibaca: Number(row.read_count) || 0,
      total_baca_jam: totalHours,
      soal_dikerjakan: attempts,
      winrate,
      avg_speed: Number(row.avg_time_per_question) || 0,
      cognitive_index: Number(row.avg_cognitive_index) || 0
    };
  });
}
