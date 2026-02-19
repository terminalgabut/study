// js/services/profileService.js

import { supabase } from './supabase.js';
import { normalizeDimension } from '../utils/dimensionNormalizer.js';

/* =====================================================
   👤 PROFILE BASIC
   ===================================================== */

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
   📈 COGNITIVE HISTORY (FOR TREND ENGINE)
   ===================================================== */

export async function getCognitiveHistory(userId) {
  const { data, error } = await supabase
    .from('user_cognitive_history') // tabel baru
    .select(`
      iq_estimated,
      iq_confidence,
      memory_score,
      reading_score,
      reasoning_score,
      analogy_score,
      vocabulary_score,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getCognitiveHistory error:', error);
    return [];
  }

  return data || [];
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

/* =====================================================
   🧠 COGNITIVE SUMMARY (IQ + Stability)
   ===================================================== */

export async function getCognitiveSummary(userId) {
  const { data, error } = await supabase
    .from('user_cognitive_profile')
    .select(`
      stability_index,
      accuracy_stability,
      speed_stability,
      endurance_index,
      error_consistency,
      iq_estimated,
      iq_class,
      iq_confidence,
      neuro_type
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getCognitiveSummary error:', error);
    return null;
  }

  if (!data) return null;

  return {
    stability_index: Number(data.stability_index) || 0,
    accuracy_stability: Number(data.accuracy_stability) || 0,
    speed_stability: Number(data.speed_stability) || 0,
    endurance_index: Number(data.endurance_index) || 0,
    error_consistency: Number(data.error_consistency) || 0,
    iq_estimated: Number(data.iq_estimated) || 0,
    iq_class: data.iq_class || "Unknown",
    iq_confidence: Number(data.iq_confidence) || 0,
    neuro_type: data.neuro_type || "Unknown"
  };
}
