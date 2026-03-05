// js/services/journalService.js

import { supabase } from './supabase.js'

/* =====================================================
   PUBLIC API
===================================================== */

export async function getWeeklySnapshots(userId) {
  if (!userId) return []

  await ensureCurrentWeekSnapshot(userId)

  const { data, error } = await supabase
    .from('weekly_journal_snapshot')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })

  if (error) {
    console.error('getWeeklySnapshots error:', error)
    return []
  }

  return data ?? []
}

/* =====================================================
   ENSURE SNAPSHOT
===================================================== */

async function ensureCurrentWeekSnapshot(userId) {
  const { startISO, endISO } = getCurrentWeekRange()

  await generateWeeklySnapshot(userId, startISO, endISO)
}

/* =====================================================
   GENERATE SNAPSHOT (Cleaner)
===================================================== */

async function generateWeeklySnapshot(userId, startISO, endISO) {

  const [attemptRes, sessionRes] = await Promise.all([
    supabase 
     .from('study_attempts') 
     .select('score, duration_seconds, submitted_at')
     .eq('user_id', userId)
     .gte('submitted_at', startISO)
     .lt('submitted_at', endISO),

    supabase
  .from('learning_sessions')
  .select('reading_seconds, quiz_seconds, bab_title, category, created_at')
      .eq('user_id', userId)
      .gte('created_at', startISO)
      .lt('created_at', endISO)
  ])

  if (attemptRes.error || sessionRes.error) {
    console.error('Snapshot fetch error:', attemptRes.error || sessionRes.error)
    return
  }

  const attempts = attemptRes.data ?? []
  const sessions = sessionRes.data ?? []

  const metrics = calculateMetrics(attempts, sessions)

  const insight = generateInsight(metrics)

  await supabase
  .from('weekly_journal_snapshot')
  .upsert({
    user_id: userId,
    week_start: toDateOnly(startISO),
    week_end: toDateOnly(endISO),
    ...metrics,
    insight
  }, {
    onConflict: 'user_id,week_start'
  })
}

  /* =============================
     METRIC ENGINE
  ============================== */
function calculateMetrics(attempts, sessions) {

  /* =============================
     ATTEMPTS LOOP
  ============================== */

  let totalQuestions = 0
  let totalCorrect = 0
  let totalDurationSeconds = 0

  for (const a of attempts) {

    totalQuestions++

    totalCorrect += Number(a.score) || 0
    totalDurationSeconds += Number(a.duration_seconds) || 0
  }

  const avgScore =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0

  const avgSpeed =
    totalQuestions > 0
      ? Number((totalDurationSeconds / totalQuestions).toFixed(1))
      : 0


  /* =============================
     SESSIONS LOOP
  ============================== */

  let totalReadingSeconds = 0
  let totalQuizSeconds = 0

  const hourCounter = {}
  const categoryCounter = {}
  const babCounter = {}
  const babDurations = {}

  for (const s of sessions) {

    const reading = Number(s.reading_seconds) || 0
    const quiz = Number(s.quiz_seconds) || 0
    const duration = reading + quiz

    totalReadingSeconds += reading
    totalQuizSeconds += quiz

    /* jam aktif */

    if (s.created_at) {

      const hour = new Date(s.created_at)
        .toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          hour12: false
        })

      hourCounter[hour] = (hourCounter[hour] || 0) + 1
    }

    /* kategori */

    if (s.category) {
      categoryCounter[s.category] =
        (categoryCounter[s.category] || 0) + 1
    }

    /* bab */

    if (s.bab_title && s.bab_title.trim() !== '') {

      babCounter[s.bab_title] =
        (babCounter[s.bab_title] || 0) + 1

      babDurations[s.bab_title] =
        (babDurations[s.bab_title] || 0) + duration
    }
  }


  const totalStudySeconds =
    totalReadingSeconds + totalQuizSeconds


  /* =============================
     JAM AKTIF
  ============================== */

  let mostActiveHour = null
  let hourMax = 0

  for (const h in hourCounter) {
    if (hourCounter[h] > hourMax) {
      hourMax = hourCounter[h]
      mostActiveHour = h
    }
  }


  /* =============================
     CATEGORY
  ============================== */

  const uniqueCategoryCount =
    Object.keys(categoryCounter).length

  let mostActiveCategory = null
  let categoryMax = 0

  for (const c in categoryCounter) {
    if (categoryCounter[c] > categoryMax) {
      categoryMax = categoryCounter[c]
      mostActiveCategory = c
    }
  }


  /* =============================
     BAB METRICS
  ============================== */

  const uniqueBabCount =
    Object.keys(babCounter).length

  let reviewBabCount = 0

  for (const b in babCounter) {
    if (babCounter[b] > 1) reviewBabCount++
  }

  let dominantBab = null
  let maxDuration = -1

  for (const b in babDurations) {
    if (babDurations[b] > maxDuration) {
      maxDuration = babDurations[b]
      dominantBab = b
    }
  }


  return {

  /* quiz */

  total_quiz_attempts: totalQuestions,
  total_quiz_score: totalCorrect,
  avg_score: avgScore,
  avg_speed_seconds: avgSpeed,

  /* study */

  total_reading_seconds: totalReadingSeconds,
  total_quiz_seconds: totalQuizSeconds,
  total_study_seconds: totalStudySeconds,

  most_active_hour: mostActiveHour ? `${mostActiveHour}:00` : '00:00',

  unique_category_count: uniqueCategoryCount,
  most_active_category: mostActiveCategory,

  unique_bab_count: uniqueBabCount,
  review_bab_count: reviewBabCount,
  dominant_bab: dominantBab,

  bab_durations: babDurations
}
}

  
  /* =============================
     INSIGHT ENGINE (Lebih Smart)
  ============================== */

  function generateInsight({
  avg_score,
  total_study_seconds,
  total_quiz_attempts
}) {

  const minutes = total_study_seconds / 60

  let summary = ''
  let strength = '-'
  let improvement = '-'

  if (total_quiz_attempts === 0) {
    summary = 'Minggu ini belum ada aktivitas kuis.'
    improvement = 'Coba mulai dengan satu latihan kecil.'
  }
  else if (avg_score >= 80) {
    summary = 'Performa belajar sangat stabil minggu ini.'
    strength = 'Akurasi tinggi dan konsisten.'
    improvement = 'Tingkatkan level kesulitan soal.'
  }
  else if (avg_score >= 60) {
    summary = 'Performa cukup baik namun masih bisa ditingkatkan.'
    strength = 'Konsistensi latihan.'
    improvement = 'Evaluasi pola kesalahanmu.'
  }
  else {
    summary = 'Minggu ini cukup menantang.'
    strength = 'Kamu tetap aktif berlatih.'
    improvement = 'Perlu review materi dasar.'
  }

 if (minutes < 90) {
  improvement += ' Tambahkan durasi belajar agar lebih optimal.'
}

  return { summary, strength, improvement }
  }

  /* =============================
     WEEK RANGE FIX (Lebih Stabil)
  ============================== */

  function getCurrentWeekRange() {
  const now = new Date()

  const day = now.getDay() || 7 // Minggu = 7

  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)

  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)

  return {
    startISO: monday.toISOString(),
    endISO: nextMonday.toISOString()
  }
  }

function toDateOnly(isoString) {
  return isoString.split('T')[0]
}
