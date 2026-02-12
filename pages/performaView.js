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
  </div>

  <div class="home-grid">
    <div class="home-card stat-item" id="card-materi" style="cursor: pointer;">
      <h3>Bab Dipelajari</h3>
      <p class="highlight" id="stat-materi">0</p>
      <p class="small gray">↗</p>
    </div>

    <div class="home-card stat-item" id="card-durasi" style="cursor: pointer;">
      <h3>Total Durasi</h3>
      <p class="highlight" id="stat-durasi">0m</p>
      <p class="small gray">↗</p>
    </div>

    <div class="home-card stat-item" id="card-ulang" style="cursor: pointer;">
      <h3>Materi Diulang</h3>
      <p class="highlight" id="stat-read-count">0</p>
      <p class="small gray">↗</p>
    </div>

    <div class="home-card stat-item" id="card-akurasi" style="cursor: pointer;">
      <h3>Akurasi Kuis</h3>
      <p class="highlight" id="stat-skor">0%</p>
      <p class="small gray">↗</p>
    </div>
  </div>

  <div class="home-grid" style="margin-top: var(--space-md);">
    <div class="home-card wide-card">
      <h3>📈 Efektivitas Belajar</h3>
      <p class="small gray">Hubungan antara waktu baca dan perolehan skor</p>
      <div class="chart-wrapper" style="height: 250px; margin-top: 15px;">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>📊 Distribusi Poin</h3>
      <p class="small gray">Peta kekuatan materi</p>
      <div class="chart-wrapper" style="height: 200px; margin-top: 10px;">
        <canvas id="categoryChart"></canvas>
      </div>
    </div>

    <div class="home-card">
      <h3>🏆 Lencana Milestone</h3>
      <div id="badge-container" class="badge-list" style="margin-top: 10px;">
        <p class="small gray">Memuat lencana...</p>
      </div>
    </div>

    <div class="home-card wide-card">
      <h3>📜 Jurnal Aktivitas Terakhir</h3>
      <ul class="task-list" id="activity-list" style="margin-top: 10px;">
        <li class="small gray">Memuat riwayat belajar...</li>
      </ul>
    </div>
  </div>
</section>
`;
