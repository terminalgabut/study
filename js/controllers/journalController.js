// js/controllers/journalController.js

import { supabase } from '../services/supabase.js'
import { getWeeklySnapshots } from '../services/journalService.js'

export async function initJournalPage() {
  const container = document.getElementById('journalListContainer')
  if (!container) return

  renderMessage(container, 'Memuat journal mingguan...')

  try {
    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data?.user) {
      renderMessage(container, 'Kamu harus login untuk melihat journal.')
      return
    }

    const user = data.user
    const snapshots = await getWeeklySnapshots(user.id)

    if (!snapshots.length) {
      renderMessage(container, 'Belum ada journal mingguan tersedia.')
      return
    }

    container.innerHTML = snapshots
      .map(createJournalCard)
      .join('')

  } catch (err) {
    console.error('Journal init error:', err)
    renderMessage(container, 'Terjadi kesalahan saat memuat journal.')
  }
}

/* =====================================================
   CARD GENERATOR
===================================================== */

function createJournalCard(snapshot) {
  const start = formatDate(snapshot.week_start)
  const end = formatDate(snapshot.week_end)

  const totalSeconds = Number(snapshot.total_study_seconds) || 0
  const timeString = formatDuration(totalSeconds)

  const insight = parseInsight(snapshot.insight)

// ===== Phase 2 Metrics (Single Dominant Bab) =====
const uniqueBabCount = snapshot.unique_bab_count || 0
const reviewBabCount = snapshot.review_bab_count || 0

const dominantBab = snapshot.dominant_bab || '-'
const dominantBabSeconds = snapshot.dominant_bab_seconds || 0
const dominantBabDuration = formatDuration(dominantBabSeconds)
  

  return `
    <div class="home-card">
      <h3>🗓 ${start} – ${end}</h3>

      <div class="journal-stats">
  <p><strong>🏆 Kuis Selesai:</strong> ${snapshot.total_quiz_attempts || 0}</p>
  <p><strong>📊 Rate Score:</strong> ${snapshot.avg_score || 0}%</p>
  <p><strong>⏳ Study Time:</strong> ${timeString}</p>
  <p><strong>⚡ Speed:</strong> ${snapshot.avg_speed_seconds || 0}s / soal</p>
  <p><strong>🕒 Jam Aktif:</strong> ${formatHour(snapshot.most_active_hour)}</p>
  <p><strong>📚 Kategori Dieksplor:</strong> ${snapshot.unique_category_count || 0}</p>
  <p><strong>🏷 Kategori Aktif:</strong> ${snapshot.most_active_category || '-'}</p>
  <p><strong>📖 Bab Dipelajari:</strong> ${uniqueBabCount}</p>
  <p><strong>🔁 Bab Direview:</strong> ${reviewBabCount}</p>
  <p><strong>👑 Bab Terlama:</strong> ${dominantBab} (${dominantBabDuration})</p>
</div>

      <div class="journal-insight">
        <p>${insight.summary}</p>
        <p><strong>Kekuatan:</strong> ${insight.strength}</p>
        <p><strong>Area Pengembangan:</strong> ${insight.improvement}</p>
      </div>
    </div>
  `
}

/* =====================================================
   UTIL HELPERS
===================================================== */

function renderMessage(container, message) {
  container.innerHTML = `
    <div class="home-card">
      <p>${message}</p>
    </div>
  `
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}j ${minutes}m` : `${hours}j`
  }

  return `${minutes}m`
}

function formatHour(hour) {
  if (hour === null || hour === undefined) return '-'
  return `${String(hour).padStart(2, '0')}:00`
}

/* =====================================================
   INSIGHT PARSER
===================================================== */

function parseInsight(raw) {
  if (!raw) {
    return {
      summary: 'Belum ada insight.',
      strength: '-',
      improvement: '-'
    }
  }

  try {
    const parsed =
      typeof raw === 'string'
        ? JSON.parse(raw)
        : raw

    return {
      summary: parsed?.summary || '',
      strength: parsed?.strength || '-',
      improvement: parsed?.improvement || '-'
    }
  } catch {
    return {
      summary: String(raw),
      strength: '-',
      improvement: '-'
    }
  }
}

/* =====================================================
   DATE FORMATTER
===================================================== */

function formatDate(dateStr) {
  if (!dateStr) return '-'

  const d = new Date(dateStr)

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
