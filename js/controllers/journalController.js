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
