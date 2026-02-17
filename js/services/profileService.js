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
    .from('study_attempts')
    .select('dimension, score')
    .eq('user_id', userId);

  if (error) {
    console.error('getProfileRadarStats error:', error);
    return null;
  }

  // 5 dimensi utama (default kosong)
  const grouped = {
    reading: [],
    vocabulary: [],
    reasoning: [],
    analogy: [],
    memory: []
  };

  data.forEach(row => {
    const key = normalizeDimension(row.dimension);
    if (key && grouped[key]) {
      grouped[key].push(row.score ?? 0);
    }
  });

  // hitung rata-rata
  const result = Object.keys(grouped).map(key => {
    const arr = grouped[key];
    const avg =
      arr.length > 0
        ? arr.reduce((a, b) => a + b, 0) / arr.length
        : 0;

    return {
      dimension: key,
      value: Math.round(avg)
    };
  });

  return result;
}
