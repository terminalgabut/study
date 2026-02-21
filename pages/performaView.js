// root/pages/performaView.js

export const performaView = `
<section class="home">
  <div class="home-card hero">
    <h1 id="user-fullname">Jurnal Belajar</h1>
    <p class="subtitle" id="user-rank">Memuat Level...</p>
    
    <div class="xp-container">
      <div class="xp-info">
        <span class="small">Akumulasi</span>
        <span class="small" id="xp-text">0 Xp</span>
      </div>
      <div class="xp-bar-bg">
        <div id="xp-fill" class="xp-bar-fill" style="width: 0%"></div>
      </div>
    </div>

    <div id="calendar-filter-container" style="margin-top: 20px; border-top: 1px solid rgba(56, 189, 248, 0.1); pt-15px">
      <button id="calendar-trigger" style="
        width: 100%;
        margin-top: 15px;
        padding: 12px 15px;
        background: rgba(56, 189, 248, 0.05);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 10px;
        color: #7dd3fc;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-calendar-alt" style="color: #38bdf8;"></i>
          <span id="selected-date-range" style="font-size: 0.9em; font-weight: 500;">Pilih Rentang Waktu</span>
        </div>
        <i class="fas fa-chevron-down" style="font-size: 0.8em; opacity: 0.5;"></i>
      </button>
      <div id="calendar-popover" style="display: none; position: absolute; z-index: 100; margin-top: 5px;"></div>
    </div>

    <div class="stats-header-grid" style="margin-top: 25px;">
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
