export const homeView = `
<section class="home">
  <div class="home-card hero">
    <h1>Halo 👋</h1>

    <p class="subtitle">
      Selamat datang di <strong>Study App</strong>
    </p>

    <p class="desc">
      Tempat belajar yang simpel, fokus, dan bebas distraksi.
      Bangun kebiasaan belajar sedikit demi sedikit, tapi konsisten.
    </p>

    <p class="desc">
      Tidak perlu terburu-buru — yang penting terus berjalan 🚀
    </p>
  </div>

 <div class="home-grid">
  <!-- Lanjutkan Belajar -->
  <div class="home-card" id="lastReadCard">
  <h3>📌 Lanjutkan Belajar</h3>
   <p class="small" id="lastReadDate">Terakhir dibuka</p>
   <p class="highlight" id="lastReadTitle">Memuat...</p>
   <button class="primary-btn" id="lastReadBtn">Lanjutkan</button>
  </div>

  <!-- Motivasi -->
  <div class="home-card">
  <h3>✨ Motivasi Hari Ini</h3>
   <p class="quote" id="motivationQuote">
    “Sedikit tapi rutin lebih kuat daripada banyak tapi jarang.”
   </p>
  </div>

    <!-- Progres -->
    <div class="home-card">
  <h3>📊 Progres Belajar</h3>
  <p>Materi dilihat: <strong id="progressStats">0 / 0</strong></p>
  <p>Belajar minggu ini: <strong id="studyTime">0 menit</strong></p>
</div>

<!-- Target -->
  <div class="home-card">
    <h3>🎯 Target Hari Ini</h3>
    <ul class="task-list" id="dailyTargetList">
      <li>Memuat target...</li>
    </ul>
  </div>

 <!-- Rekomendasi -->
    <div class="home-card">
  <h3>📚 Materi Disarankan</h3>
  <ul class="link-list"> 
    <li>Memuat saran...</li>
  </ul>
</div>

 </div>
</section>
';
