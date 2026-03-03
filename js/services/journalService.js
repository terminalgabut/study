// js/services/journalService.js

import { supabase } from './supabase.js'

/* =====================================================
   PUBLIC API
===================================================== */

export async function getWeeklySnapshots(userId) {
  if (!userId) return []

  // Pastikan snapshot minggu ini ada
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

  return data || []
}

/* =====================================================
   ENSURE SNAPSHOT EXISTS (AUTO GENERATE)
===================================================== */

async function ensureCurrentWeekSnapshot(userId) {
  const { start, end } = getCurrentWeekRange()

  const { data } = await supabase
    .from('weekly_journal_snapshot')
    .select('id')
    .eq('user_id', userId)
    .eq('week_start', start.toISOString())
    .maybeSingle()

  if (!data) {
    await generateWeeklySnapshot(userId, start, end)
  }
}

/* =====================================================
   GENERATE SNAPSHOT
===================================================== */

async function generateWeeklySnapshot(userId, startDate, endDate) {

  const { data: attempts = [], error: attemptError } = await supabase
    .from('study_attempts')
    .select('score, duration_seconds, category')
    .eq('user_id', userId)
    .gte('submitted_at', startDate.toISOString())
    .lte('submitted_at', endDate.toISOString())

  if (attemptError) {
    console.error('Attempt fetch error:', attemptError)
    return
  }

  const { data: sessions = [], error: sessionError } = await supabase
    .from('learning_sessions')
    .select('reading_seconds, quiz_seconds')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (sessionError) {
    console.error('Session fetch error:', sessionError)
    return
  }

  /* =============================
     CALCULATION
  ============================== */

  const totalQuizAttempts = attempts.length

  const totalQuizScore = attempts.reduce(
    (acc, a) => acc + (Number(a.score) || 0),
    0
  )

  // ASUMSI score sudah 0–100
  const avgScore =
    totalQuizAttempts > 0
      ? Math.round(totalQuizScore / totalQuizAttempts)
      : 0

  const totalReadingSeconds = sessions.reduce(
    (acc, s) => acc + (Number(s.reading_seconds) || 0),
    0
  )

  const totalQuizSeconds = sessions.reduce(
    (acc, s) => acc + (Number(s.quiz_seconds) || 0),
    0
  )

  const totalStudySeconds =
    totalReadingSeconds + totalQuizSeconds

  /* =============================
     MOST ACTIVE CATEGORY
  ============================== */

  const categoryCount = {}

  attempts.forEach(a => {
    if (!a.category) return
    categoryCount[a.category] =
      (categoryCount[a.category] || 0) + 1
  })

  const mostActiveCategory =
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null

  /* =============================
     INSIGHT GENERATOR
  ============================== */

  const insight = generateInsight({
    avgScore,
    totalStudySeconds,
    totalQuizAttempts
  })

  /* =============================
     SAVE SNAPSHOT
  ============================== */

  await supabase
    .from('weekly_journal_snapshot')
    .upsert({
      user_id: userId,
      week_start: startDate.toISOString(),
      week_end: endDate.toISOString(),
      total_quiz_attempts: totalQuizAttempts,
      total_quiz_score: totalQuizScore,
      avg_score: avgScore,
      total_reading_seconds: totalReadingSeconds,
      total_quiz_seconds: totalQuizSeconds,
      total_study_seconds: totalStudySeconds,
      most_active_category: mostActiveCategory,
      insight
    }, {
      onConflict: 'user_id,week_start'
    })
}

/* =====================================================
   INSIGHT ENGINE
===================================================== */

function generateInsight({ avgScore, totalStudySeconds, totalQuizAttempts }) {

  const hours = totalStudySeconds / 3600

  let summary = ''
  let strength = '-'
  let improvement = '-'

  if (totalQuizAttempts === 0) {
    summary = 'Minggu ini belum ada aktivitas kuis.'
    improvement = 'Coba mulai dengan satu latihan kecil.'
  }
  else if (avgScore >= 80) {
    summary = 'Performa belajar kamu sangat stabil minggu ini.'
    strength = 'Akurasi tinggi dan konsisten.'
    improvement = 'Tingkatkan tantangan soal untuk growth.'
  }
  else if (avgScore >= 60) {
    summary = 'Performa cukup baik namun masih bisa ditingkatkan.'
    strength = 'Konsistensi mengerjakan latihan.'
    improvement = 'Perdalam konsep pada soal yang sering salah.'
  }
  else {
    summary = 'Minggu ini cukup menantang untukmu.'
    strength = 'Kamu tetap berlatih meski sulit.'
    improvement = 'Fokus ulang pada materi dasar sebelum lanjut.'
  }

  if (hours < 2) {
    improvement += ' Tambahkan durasi belajar agar lebih optimal.'
  }

  return { summary, strength, improvement }
}

/* =====================================================
   WEEK RANGE HELPER
===================================================== */

function getCurrentWeekRange() {
  const now = new Date()

  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const start = new Date(now)
  start.setDate(now.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
