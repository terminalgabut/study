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

      <div class="stat-item perf-card" id="card-durasi">
        <span class="small">Total Durasi</span>
        <p class="highlight" id="stat-durasi">0m</p>
        <span class="card-arrow">↗</span>
      </div>

      <div class="stat-item perf-card" id="card-ulang">
        <span class="small">Materi Diulang</span>
        <p class="highlight" id="stat-read-count">0</p>
        <span class="card-arrow">↗</span>
      </div>

      <div class="stat-item perf-card" id="card-akurasi">
        <span class="small">Akurasi Kuis</span>
        <p class="highlight" id="stat-skor">0%</p>
        <span class="card-arrow">↗</span>
      </div>
    </div>
  </div>
  <div class="home-grid" style="margin-top: var(--space-md);">
    
    <div class="home-card hero">
      <h3>📈 Efektivitas Belajar</h3>
      <p class="small gray">Hubungan waktu baca vs perolehan poin</p>
      <div class="chart-wrapper" style="height: 250px; margin-top: 15px;">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="home-card hero">
      <h3>📊 Distribusi Poin</h3>
      <p class="small gray">Peta kekuatan materi</p>
      <div class="chart-wrapper" style="height: 250px; margin-top: 15px;">
        <canvas id="categoryChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>🏆 Lencana Milestone</h3>
      <div id="badge-container" class="badge-list" style="margin-top: 10px;">
        </div>
    </div>

    <div class="home-card">
      <h3>📜 Jurnal Aktivitas Terakhir</h3>
      <ul class="task-list" id="activity-list" style="margin-top: 10px;">
        </ul>
    </div>

  </div>
</section>
`;
