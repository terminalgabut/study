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
  const { start, end } = getCurrentWeekRange()

  const { data } = await supabase
    .from('weekly_journal_snapshot')
    .select('id')
    .eq('user_id', userId)
    .eq('week_start', toDateOnly(start))
    .maybeSingle()

  if (!data) {
    await generateWeeklySnapshot(userId, start, end)
  }
}
/* =====================================================
   GENERATE SNAPSHOT (Cleaner)
===================================================== */

async function generateWeeklySnapshot(userId, startDate, endDate) {

  const startISO = startDate.toISOString()
  const endISO = endDate.toISOString()

  const [attemptRes, sessionRes] = await Promise.all([
    supabase
      .from('study_attempts')
      .select('score, category')
      .eq('user_id', userId)
      .gte('submitted_at', startISO)
      .lte('submitted_at', endISO),

    supabase
      .from('learning_sessions')
      .select('reading_seconds, quiz_seconds')
      .eq('user_id', userId)
      .gte('created_at', startISO)
      .lte('created_at', endISO)
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
      week_start: toDateOnly(startDate),
      week_end: toDateOnly(endDate),
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

  const totalQuizAttempts = attempts.length

  const totalQuizScore = attempts.reduce(
    (sum, a) => sum + (Number(a.score) || 0),
    0
  )

  const avgScore =
    totalQuizAttempts > 0
      ? Math.round(totalQuizScore / totalQuizAttempts)
      : 0

  const totalReadingSeconds = sessions.reduce(
    (sum, s) => sum + (Number(s.reading_seconds) || 0),
    0
  )

  const totalQuizSeconds = sessions.reduce(
    (sum, s) => sum + (Number(s.quiz_seconds) || 0),
    0
  )

  const totalStudySeconds =
    totalReadingSeconds + totalQuizSeconds

  const mostActiveCategory = getMostActiveCategory(attempts)

  return {
    total_quiz_attempts: totalQuizAttempts,
    total_quiz_score: totalQuizScore,
    avg_score: avgScore,
    total_reading_seconds: totalReadingSeconds,
    total_quiz_seconds: totalQuizSeconds,
    total_study_seconds: totalStudySeconds,
    most_active_category: mostActiveCategory
  }
  }

  /* =============================
     CATEGORY HELPER
  ============================== */

  function getMostActiveCategory(attempts) {
  const counter = {}

  attempts.forEach(a => {
    if (!a.category) return
    counter[a.category] = (counter[a.category] || 0) + 1
  })

  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  }

  /* =============================
     INSIGHT ENGINE (Lebih Smart)
  ============================== */

  function generateInsight({
  avg_score,
  total_study_seconds,
  total_quiz_attempts
}) {

  const hours = total_study_seconds / 3600

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

  if (hours < 2) {
    improvement += ' Tambahkan durasi belajar agar lebih optimal.'
  }

  return { summary, strength, improvement }
  }

  /* =============================
     WEEK RANGE FIX (Lebih Stabil)
  ============================== */

  function getCurrentWeekRange() {
  const now = new Date()

  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { start: monday, end: sunday }
}

function toDateOnly(date) {
  return date.toISOString().split('T')[0]
}
