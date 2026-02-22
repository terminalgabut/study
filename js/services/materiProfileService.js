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
    const readCount = Number(row.read_count) || 0;

    // ===== WINRATE =====
    const winrate = attempts > 0
      ? Math.round((totalPoints / attempts) * 100)
      : 0;

    // ===== TOTAL WAKTU (HOURS) =====
    const totalSeconds =
      (Number(row.total_reading_seconds) || 0) +
      (Number(row.total_quiz_seconds) || 0);

    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

    // ===== SPEED =====
    const avgSpeed = Math.round(Number(row.avg_time_per_question) || 0);

    // ===== COGNITIVE =====
    const cognitiveIndex = Math.round(Number(row.avg_cognitive_index) || 0);

    // ===== STRENGTH ENGINE =====
    const strengthProfile = buildStrengthProfile({
      winrate,
      cognitiveIndex,
      avgSpeed
    });

    const narrative = buildStrengthNarrative(strengthProfile);

    return {
      category: row.category || '-',
      judul: row.bab_title || '-',
      dibaca: readCount,
      total_baca_jam: totalHours,
      soal_dikerjakan: attempts,
      winrate,
      avg_speed: avgSpeed,
      cognitive_index: cognitiveIndex,
      strength: narrative.strength || '',
      needs_work: narrative.needsWork || ''
    };
  });
}
