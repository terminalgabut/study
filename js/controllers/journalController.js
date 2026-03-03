// js/controllers/journalController.js

import { supabase } from '../services/supabase.js'
import { getWeeklySnapshots } from '../services/journalService.js'

export async function initJournalPage() {
  const container = document.getElementById('journalListContainer')
  if (!container) return

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    container.innerHTML = `
      <div class="home-card">
        <p>Kamu harus login untuk melihat journal.</p>
      </div>
    `
    return
  }

  const snapshots = await getWeeklySnapshots(user.id)

  if (!snapshots.length) {
    container.innerHTML = `
      <div class="home-card">
        <p>Belum ada journal mingguan tersedia.</p>
      </div>
    `
    return
  }

  container.innerHTML = snapshots
    .map(createJournalCard)
    .join('')
}

//===
// Card Generator (Clean & Premium Feel)
//===
function createJournalCard(snapshot) {
  const start = formatDate(snapshot.week_start)
  const end = formatDate(snapshot.week_end)

  const hours = Math.floor(snapshot.total_study_seconds / 3600)
  const minutes = Math.floor((snapshot.total_study_seconds % 3600) / 60)

  const insight = parseInsight(snapshot.insight)

  return `
    <div class="home-card">
      <h3>🗓 ${start} – ${end}</h3>

      <div class="journal-stats">
        <p><strong>🎯 Attempts:</strong> ${snapshot.total_quiz_attempts}</p>
        <p><strong>📊 Avg Score:</strong> ${snapshot.avg_score}%</p>
        <p><strong>⏱ Study Time:</strong> ${hours}j ${minutes}m</p>
        <p><strong>🏷 Kategori Aktif:</strong> ${snapshot.most_active_category || '-'}</p>
      </div>

      <div class="journal-insight">
        <p>${insight.summary}</p>
        <p><strong>Kekuatan:</strong> ${insight.strength}</p>
        <p><strong>Area Pengembangan:</strong> ${insight.improvement}</p>
      </div>
    </div>
  `
}

//===
// Insight Parser (JSON Safe)
//===
function parseInsight(raw) {
  if (!raw) {
    return {
      summary: 'Belum ada insight.',
      strength: '-',
      improvement: '-'
    }
  }

  try {
    const parsed = typeof raw === 'string'
      ? JSON.parse(raw)
      : raw

    return {
      summary: parsed.summary || '',
      strength: parsed.strength || '-',
      improvement: parsed.improvement || '-'
    }
  } catch {
    return {
      summary: raw,
      strength: '-',
      improvement: '-'
    }
  }
}

//===
// Date Formatter
//===
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
