export const performaView = `
<section class="home">
  <div class="home-card hero">
    <h1 id="user-fullname">Jurnal Belajar</h1>
    <p class="subtitle" id="user-rank">Memuat Level...</p>
    
    <div class="xp-container">
      <div class="xp-info">
        <span class="small">Akumulasi Poin</span>
        <span class="small" id="xp-text">0 Poin</span>
      </div>
      <div class="xp-bar-bg">
        <div id="xp-fill" class="xp-bar-fill" style="width: 0%"></div>
      </div>
    </div>

    <div class="stats-header-grid">
  <div class="stat-item perf-card" id="card-materi">
    <span class="small">Bab Dipelajari</span>
    <p class="highlight" id="stat-materi">0</p>
    <span class="card-arrow">↗</span>
  </div>

  <div class="stat-item perf-card" id="card-waktu">
    <span class="small">Total Durasi</span>
    <p class="highlight" id="stat-waktu">0m</p>
  </div>

  <div class="stat-item perf-card" id="card-count">
    <span class="small">Materi Diulang</span>
    <p class="highlight" id="stat-read-count">0</p>
  </div>

  <div class="stat-item perf-card" id="card-skor">
    <span class="small">Akurasi Kuis</span>
    <p class="highlight" id="stat-skor">0%</p>
  </div>
</div>

  <div class="home-grid">
    
    <div class="home-card wide-card">
      <h3>📈 Efektivitas Belajar</h3>
      <p class="small gray">Hubungan antara waktu baca dan perolehan skor</p>
      <div class="chart-wrapper">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>📊 Distribusi Poin</h3>
      <p class="small gray">Peta kekuatan berdasarkan kategori materi</p>
      <div class="chart-wrapper">
        <canvas id="categoryChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>🏆 Lencana Milestone</h3>
      <div id="badge-container" class="badge-list">
        <p class="small gray">Memuat lencana...</p>
      </div>
    </div>

    <div class="home-card wide-card">
      <h3>📜 Jurnal Aktivitas Terakhir</h3>
      <ul class="task-list" id="activity-list">
        <li class="small gray">Memuat riwayat belajar...</li>
      </ul>
    </div>

  </div>
</section>
`;
