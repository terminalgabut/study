export const performaView = `
<section class="home">
  <div class="home-card hero">
    <div class="profile-header-flex">
      <div class="avatar-circle" id="user-avatar-placeholder">👤</div>
      <div>
        <h1 id="display-name">Jurnal Belajar</h1>
        <p class="subtitle" id="user-level">Level: Pemula</p>
      </div>
    </div>
    
    <div class="xp-container">
      <div class="xp-info">
        <span class="small">Progress XP</span>
        <span class="small" id="xp-text">0 / 100</span>
      </div>
      <div class="xp-bar-bg">
        <div id="xp-fill" class="xp-bar-fill" style="width: 0%"></div>
      </div>
    </div>
  </div>

  <div class="home-grid">

    <div class="home-card">
      <h3>📊 Statistik Global</h3>
      <p class="desc">Materi Selesai: <strong id="total-materi">0</strong></p>
      <p class="desc">Total Waktu Baca: <strong id="total-durasi">0m</strong></p>
      <p class="desc">Rata-rata Skor: <strong id="avg-score">0%</strong></p>
    </div>

    <div class="home-card wide-card">
      <h3>📈 Tren Belajar</h3>
      <div class="chart-wrapper">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>🏆 Lencana Diraih</h3>
      <div id="badge-container" class="badge-list">
        <p class="small">Belum ada lencana</p>
      </div>
    </div>

    <div class="home-card">
      <h3>📜 Jurnal Aktivitas</h3>
      <ul class="task-list" id="activity-list">
        <li class="small">Belum ada aktivitas</li>
      </ul>
    </div>

  </div>
</section>
`;
