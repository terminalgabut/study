// js/services/profileService.js
import { supabase } from './supabase.js';
import { normalizeDimension } from '../utils/dimensionNormalizer.js';

/**
 * Ambil profil berdasarkan userId
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('getProfile error:', error);
    return null;
  }

  return data;
}

/**
 * Update sebagian field profil
 */
export async function updateProfile(userId, payload) {
  const { data, error } = await supabase
    .from('profile')
    .update(payload)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('updateProfile error:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert (insert jika belum ada, update jika sudah ada)
 */
export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profile')
    .upsert(profile)
    .select()
    .maybeSingle();

  if (error) {
    console.error('upsertProfile error:', error);
    throw error;
  }

  return data;
}

/* =====================================================
   📊 RADAR STATS PROFILE
   ===================================================== */
export async function getProfileRadarStats(userId) {
  const { data, error } = await supabase
    .from('user_cognitive_profile')
    .select(`
      memory_score,
      reading_score,
      reasoning_score,
      analogy_score,
      vocabulary_score
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getProfileRadarStats error:', error);
    return null;
  }

  if (!data) return null;

  return [
    { dimension: 'memory', value: Number(data.memory_score) || 0 },
    { dimension: 'reading', value: Number(data.reading_score) || 0 },
    { dimension: 'reasoning', value: Number(data.reasoning_score) || 0 },
    { dimension: 'analogy', value: Number(data.analogy_score) || 0 },
    { dimension: 'vocabulary', value: Number(data.vocabulary_score) || 0 }
  ];
}
