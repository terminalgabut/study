// js/services/profileService.js

import { supabase } from './supabase.js'

/* =========================================
   SIMPLE MEMORY CACHE
========================================= */

const cache = new Map()

function setCache(key, data, ttl = 60000) {
  cache.set(key, { data, exp: Date.now() + ttl })
}

function getCache(key) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.exp) {
    cache.delete(key)
    return null
  }
  return item.data
}

/* =========================================
   👤 PROFILE BASIC (HIGH PRIORITY CACHE)
========================================= */

export async function getProfile(userId) {
  const key = `profile:${userId}`
  const cached = getCache(key)
  if (cached) return cached

  const { data, error } = await supabase
    .from('profile')
    .select('id, full_name, username, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('getProfile error:', error)
    return null
  }

  setCache(key, data, 5 * 60 * 1000) // 5 menit
  return data
}

export async function updateProfile(userId, payload) {
  const { data, error } = await supabase
    .from('profile')
    .update(payload)
    .eq('id', userId)
    .select('id, full_name, username, avatar_url')
    .maybeSingle()

  if (error) {
    console.error('updateProfile error:', error)
    throw error
  }

  setCache(`profile:${userId}`, data, 5 * 60 * 1000)
  return data
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profile')
    .upsert(profile)
    .select('id, full_name, username, avatar_url')
    .maybeSingle()

  if (error) {
    console.error('upsertProfile error:', error)
    throw error
  }

  setCache(`profile:${profile.id}`, data, 5 * 60 * 1000)
  return data
}

/* =========================================
   📈 COGNITIVE HISTORY (HEAVY DATA)
========================================= */

export async function getCognitiveHistory(userId, days = 7) {
  const key = `cognitive-history:${userId}:${days}`
  const cached = getCache(key)
  if (cached) return cached

  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString()

  const { data, error } = await supabase
    .from('user_cognitive_sessions')
    .select(`
      session_at,
      iq_final,
      iq_confidence,
      cognitive_index,
      scores
    `)
    .eq('user_id', userId)
    .gte('session_at', since)
    .order('session_at', { ascending: true })

  if (error) {
    console.error('getCognitiveHistory error:', error)
    return []
  }

  const result = (data || []).map(row => ({
    date: row.session_at,
    iq_final: Number(row.iq_final) || 0,
    iq_confidence: Number(row.iq_confidence) || 0,
    cognitive_index: Number(row.cognitive_index) || 0,
    memory: Number(row.scores?.memory) || 0,
    reading: Number(row.scores?.reading) || 0,
    reasoning: Number(row.scores?.reasoning) || 0,
    analogy: Number(row.scores?.analogy) || 0,
    vocabulary: Number(row.scores?.vocabulary) || 0
  }))

  setCache(key, result, 60 * 1000) // 1 menit (frequent refresh)
  return result
}

/* =========================================
   📊 RADAR STATS (MEDIUM CACHE)
========================================= */

export async function getProfileRadarStats(userId) {
  const key = `radar:${userId}`
  const cached = getCache(key)
  if (cached) return cached

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
    .maybeSingle()

  if (error || !data) {
    console.error('getProfileRadarStats error:', error)
    return null
  }

  const result = [
    { dimension: 'memory', value: Number(data.memory_score) || 0 },
    { dimension: 'reading', value: Number(data.reading_score) || 0 },
    { dimension: 'reasoning', value: Number(data.reasoning_score) || 0 },
    { dimension: 'analogy', value: Number(data.analogy_score) || 0 },
    { dimension: 'vocabulary', value: Number(data.vocabulary_score) || 0 }
  ]

  setCache(key, result, 2 * 60 * 1000)
  return result
}

/* =========================================
   🧠 COGNITIVE SUMMARY (CRITICAL UI DATA)
========================================= */

export async function getCognitiveSummary(userId) {
  const key = `summary:${userId}`
  const cached = getCache(key)
  if (cached) return cached

  const { data, error } = await supabase
    .from('user_cognitive_profile')
    .select(`
      cognitive_index,
      stability_index,
      accuracy_stability,
      speed_stability,
      endurance_index,
      error_consistency,
      iq_estimated,
      iq_final,
      iq_class,
      iq_confidence,
      neuro_type
    `)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    console.error('getCognitiveSummary error:', error)
    return null
  }

  const result = {
    cognitive_index: Number(data.cognitive_index) || 0,
    stability_index: Number(data.stability_index) || 0,
    accuracy_stability: Number(data.accuracy_stability) || 0,
    speed_stability: Number(data.speed_stability) || 0,
    endurance_index: Number(data.endurance_index) || 0,
    error_consistency: Number(data.error_consistency) || 0,
    iq_estimated: Number(data.iq_estimated) || 0,
    iq_final: Number(data.iq_final) || 0,
    iq_class: data.iq_class || "Unknown",
    iq_confidence: Number(data.iq_confidence) || 0,
    neuro_type: data.neuro_type || "Unknown"
  }

  setCache(key, result, 90 * 1000)
  return result
}

/* =========================================
   CACHE CONTROL (OPTIONAL API)
========================================= */

export function clearProfileCache(userId) {
  for (const key of cache.keys()) {
    if (key.includes(userId)) cache.delete(key)
  }
}
