// js/services/profileHomeService.js

import { supabase } from './supabase.js';
import { getCognitiveSummary } from './profileService.js';

export async function getProfileHomeData(userId) {
  const [
    xpRow,
    cognitive,
    cognitiveSessions,
    dailyAttempts,
    favoriteAttempts
  ] = await Promise.all([
    fetchXP(userId),
    getCognitiveSummary(userId),
    fetchRecentCognitiveSessions(userId),
    fetchTodayAttempts(userId),
    fetchRecentAttempts(userId)
  ]);

  return {
    xpRow,
    cognitive,
    cognitiveSessions,
    dailyAttempts,
    favoriteAttempts
  };
}

/* =========================
   XP
========================= */

async function fetchXP(userId) {
  const { data } = await supabase
    .from('profile')
    .select('xp')
    .eq('id', userId)
    .maybeSingle();

  return data; // raw
}

/* =========================
   Recent Cognitive Sessions
========================= */

async function fetchRecentCognitiveSessions(userId) {
  const { data } = await supabase
    .from('user_cognitive_sessions')
    .select('cognitive_index, session_at')
    .eq('user_id', userId)
    .order('session_at', { ascending: false })
    .limit(2);

  return data || [];
}

/* =========================
   Today Attempts
========================= */

async function fetchTodayAttempts(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('study_attempts')
    .select('score, duration_seconds, is_correct, submitted_at')
    .eq('user_id', userId)
    .gte('submitted_at', today.toISOString());

  return data || [];
}

/* =========================
   Recent Attempts (14 Days)
========================= */

async function fetchRecentAttempts(userId) {
  const fourteenDaysAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000
  );

  const { data } = await supabase
    .from('study_attempts')
    .select('title, submitted_at')
    .eq('user_id', userId)
    .gte('submitted_at', fourteenDaysAgo.toISOString());

  return data || [];
}
