export function renderPerformaPage() {
  const container = document.querySelector('#app');
  
  container.innerHTML = `
    <div class="performa-container">
      <section class="profile-header">
        <div class="profile-info">
          <div class="avatar-placeholder" id="user-avatar"></div>
          <div>
            <h2 id="user-name">Memuat Nama...</h2>
            <p id="user-rank" class="rank-badge">Memuat Level...</p>
          </div>
        </div>
        <div class="xp-bar-container">
          <div class="xp-text">
            <span>Progress XP</span>
            <span id="xp-value">0/1000</span>
          </div>
          <div class="xp-bar-bg">
            <div id="xp-progress-fill" class="xp-fill" style="width: 0%"></div>
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-book"></i>
          <div class="stat-content">
            <span class="stat-label">Materi Selesai</span>
            <h3 id="stat-total-materi">0</h3>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <div class="stat-content">
            <span class="stat-label">Waktu Baca</span>
            <h3 id="stat-reading-time">0m</h3>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-star"></i>
          <div class="stat-content">
            <span class="stat-label">Rata-rata Skor</span>
            <h3 id="stat-avg-score">0%</h3>
          </div>
        </div>
      </section>

      <section class="charts-section">
        <div class="chart-container">
          <h4>Tren Belajar (Skor vs Waktu)</h4>
          <canvas id="trendChart"></canvas>
        </div>
      </section>

      <div class="bottom-grid">
        <section class="achievement-section">
          <h4>Lencana Saya</h4>
          <div id="badge-list" class="badge-flex">
            <p class="empty-state">Belum ada lencana diraih</p>
          </div>
        </section>
        
        <section class="recent-activity">
          <h4>Aktivitas Terakhir</h4>
          <ul id="activity-log" class="activity-list">
            </ul>
        </section>
      </div>
    </div>
  `;

  // Setelah HTML dirender, baru kita panggil fungsi untuk fetch data dan init Chart
  initPerformaData();
}
