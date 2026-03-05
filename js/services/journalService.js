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
     .select('score, category, duration_seconds, submitted_at, question_id, title')
     .eq('user_id', userId)
     .gte('submitted_at', startISO)
     .lt('submitted_at', endISO),

    supabase
  .from('learning_sessions')
  .select('reading_seconds, quiz_seconds, bab_title')
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
     METRIC ENGINE (Dipisah)
  ============================== */

  function calculateMetrics(attempts, sessions) {

  // =============================
  // QUIZ METRICS (RAW ATTEMPTS)
  // =============================

  const totalQuestions = attempts.length

  const totalCorrect = attempts.reduce(
    (sum, a) => sum + (Number(a.score) || 0),
    0
  )

  const avgScore =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0


// =============================
// STUDY TIME (READING + QUIZ)
// =============================

const totalReadingSeconds = sessions.reduce(
  (sum, s) => sum + (Number(s.reading_seconds) || 0),
  0
)

const totalQuizSeconds = attempts.reduce(
  (sum, a) => sum + (Number(a.duration_seconds) || 0),
  0
)

const totalStudySeconds = totalReadingSeconds + totalQuizSeconds

// =============================
// AVG SPEED
// =============================

const totalDurationSeconds = attempts.reduce(
  (sum, a) => sum + (Number(a.duration_seconds) || 0),
  0
)

const avgSpeed =
  totalQuestions > 0
    ? Number((totalDurationSeconds / totalQuestions).toFixed(1))
    : 0

  // =============================
  // CATEGORY
  // =============================

  const mostActiveCategory = getMostActiveCategory(attempts)
  const mostActiveHour = getMostActiveHour(attempts)

// =============================
// UNIQUE CATEGORY COUNT
// =============================

const uniqueCategoryCount = new Set(
  attempts.map(a => a.category).filter(Boolean)
).size

const normalizeTitle = (str) =>
  (str || 'Unknown').trim()

     
// =============================
// PHASE 2: BAB ANALYTICS (WEEKLY)
// =============================


// Reading duration per bab
sessions.forEach(s => {
  const title = normalizeTitle(s.bab_title)

  const reading = Number(s.reading_seconds) || 0
  const quiz = Number(s.quiz_seconds) || 0

  const total = reading + quiz

  babDurations[title] = (babDurations[title] || 0) + total
})

// Unique bab count (weekly)
const uniqueBabCount = Object.keys(babDurations).length

// Review detection (weekly raw attempts)
const questionTracker = {}
const reviewedBabSet = new Set()

attempts.forEach(a => {
  const qid = a.question_id
 const title = normalizeTitle(a.title)

  if (!qid) return

  if (!questionTracker[qid]) {
    questionTracker[qid] = 1
  } else {
    questionTracker[qid]++
    reviewedBabSet.add(title)
  }
})

const reviewBabCount = reviewedBabSet.size

// Bab paling dominan (berdasarkan total durasi)
const dominantBab =
  Object.entries(babDurations)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
  total_quiz_attempts: totalQuestions,
  total_quiz_score: totalCorrect,
  avg_score: avgScore,

  total_reading_seconds: totalReadingSeconds,
  total_quiz_seconds: totalQuizSeconds,
  total_study_seconds: totalStudySeconds,

  avg_speed_seconds: avgSpeed,
  most_active_hour: mostActiveHour,
  unique_category_count: uniqueCategoryCount,
  most_active_category: mostActiveCategory,

  // ===== Phase 2 =====
  bab_durations: babDurations,
  unique_bab_count: uniqueBabCount,
  review_bab_count: reviewBabCount,
  dominant_bab: dominantBab
  }
  }

  /* =============================
     CATEGORY HELPER
  ============================== */
function getMostActiveHour(attempts) {
  const counter = {}

  attempts.forEach(a => {
    if (!a.submitted_at) return

    const hour = new Date(a.submitted_at)
      .toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        hour12: false
      })

    counter[hour] = (counter[hour] || 0) + 1
  })

  const result =
    Object.entries(counter)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

  return result ? `${result}:00` : null
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
