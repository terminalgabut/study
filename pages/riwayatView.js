export const historyView = `
  <div class="container fade-in">
    <div class="content-header" style="margin-bottom: 25px;">
      <h1 style="font-size: 1.8rem; font-weight: 700;">🕒 Riwayat Belajar</h1>
      <p style="opacity: 0.7; font-size: 0.9rem;">Materi yang terakhir kamu pelajari akan muncul di sini.</p>
    </div>

    <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 25px;">

    <div id="historyListContainer" class="home-grid">
      <div class="home-card">
        <p>Menyiapkan daftar riwayat...</p>
      </div>
    </div>

    <div style="margin-top: 30px; text-align: center;">
      <button class="secondary-btn" onclick="window.location.hash='#/'" style="padding: 10px 20px;">
        Kembali ke Beranda
      </button>
    </div>
  </div>
`;
