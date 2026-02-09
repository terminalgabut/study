export const performaView = `
<section class="home">
  <div class="home-card hero">
    <div class="profile-header-flex">
      <div class="avatar-circle">👤</div>
      <div>
        <h1 id="user-fullname">Jurnal Belajar</h1>
        <p class="subtitle" id="user-rank">Level: Memuat...</p>
      </div>
    </div>
    
    <div class="xp-container">
      <div class="xp-info">
        <span class="small">Progress XP</span>
        <span class="small" id="xp-text">0 / 0</span>
      </div>
      <div class="xp-bar-bg">
        <div id="xp-fill" class="xp-bar-fill" style="width: 0%"></div>
      </div>
    </div>

    <div class="stats-header-grid">
      <div class="stat-item">
        <span class="small">Total Materi</span>
        <p class="highlight" id="stat-materi">0</p>
      </div>
      <div class="stat-item">
        <span class="small">Investasi Waktu</span>
        <p class="highlight" id="stat-waktu">0m</p>
      </div>
      <div class="stat-item">
        <span class="small">Rata-rata Skor</span>
        <p class="highlight" id="stat-skor">0%</p>
      </div>
      <div class="stat-item">
        <span class="small">Streak</span>
        <p class="highlight" id="stat-streak">🔥 0</p>
      </div>
    </div>
  </div>

  <div class="home-grid">
    <div class="home-card wide-card">
      <h3>📈 Tren Belajar</h3>
      <p class="small">Perbandingan Skor vs Durasi Baca</p>
      <div class="chart-wrapper">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>📊 Peta Kekuatan</h3>
      <p class="small">Performa per Kategori</p>
      <div class="chart-wrapper">
        <canvas id="radarChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>🏆 Lencana Diraih</h3>
      <div id="badge-container" class="badge-list">
        <p class="small gray">Belum ada lencana diraih</p>
      </div>
    </div>

    <div class="home-card wide-card">
      <h3>📜 Jurnal Aktivitas</h3>
      <ul class="task-list" id="activity-list">
        <li class="small">Belum ada catatan aktivitas.</li>
      </ul>
    </div>
  </div>
</section>
`;
