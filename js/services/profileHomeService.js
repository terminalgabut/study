// js/services/profileHomeService.js

import { supabase } from './supabase.js';
import { getCognitiveSummary } from './profileService.js';

export async function getProfileHomeData(userId) {
  const [
    profileXP,
    cognitive,
    delta,
    daily,
    favorite
  ] = await Promise.all([
    getXP(userId),
    getCognitiveSummary(userId),
    getCognitiveDelta(userId),
    getDailyStats(userId),
    getFavoriteMaterial(userId)
  ]);

  return {
    xp: profileXP,
    cognitive,
    delta,
    daily,
    favorite
  };
}

/* =========================
   XP
========================= */

async function getXP(userId) {
  const { data } = await supabase
    .from('profile')
    .select('xp')
    .eq('id', userId)
    .maybeSingle();

  return Number(data?.xp) || 0;
}

/* =========================
   Cognitive Delta
========================= */

async function getCognitiveDelta(userId) {
  const { data } = await supabase
    .from('user_cognitive_sessions')
    .select('cognitive_index')
    .eq('user_id', userId)
    .order('session_at', { ascending: false })
    .limit(2);

  if (!data || data.length < 2) return 0;

  return (
    Number(data[0].cognitive_index) -
    Number(data[1].cognitive_index)
  );
}

/* =========================
   Daily Stats
========================= */

async function getDailyStats(userId) {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('study_attempts')
    .select('score, duration_seconds, is_correct')
    .eq('user_id', userId)
    .gte('submitted_at', today);

  if (!data) return null;

  const quizDone = data.length;
  const highestScore = Math.max(
    0,
    ...data.map(d => d.score || 0)
  );

  const totalSeconds = data.reduce(
    (sum, d) => sum + (d.duration_seconds || 0),
    0
  );

  const correctCount = data.filter(d => d.is_correct).length;

  return {
    quizDone,
    highestScore,
    totalSeconds,
    xpToday: correctCount // atau ganti sesuai rules
  };
}

/* =========================
   Favorite Material (14 days)
========================= */

async function getFavoriteMaterial(userId) {
  const { data } = await supabase
    .from('study_attempts')
    .select('title, submitted_at')
    .eq('user_id', userId)
    .gte(
      'submitted_at',
      new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000
      ).toISOString()
    );

  if (!data || !data.length) return null;

  const counter = {};

  data.forEach(d => {
    if (!d.title) return;
    counter[d.title] = (counter[d.title] || 0) + 1;
  });

  const sorted = Object.entries(counter)
    .sort((a, b) => b[1] - a[1]);

  return {
    title: sorted[0]?.[0] || null,
    count: sorted[0]?.[1] || 0
  };
}
