export const audioView = `
<section class="audio-page">
  <div class="home-card hero">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1>Fokus Mode 🎧</h1>
        <p class="subtitle" id="track-status">Pilih suasana belajar kamu</p>
      </div>
      <div id="music-wave" class="music-wave-hidden">
        <span></span><span></span><span></span>
      </div>
    </div>

    <div class="player-controls-compact">
      <h2 id="current-title" class="highlight">Silent Mode</h2>
      <div class="control-group">
        <button id="mainPlayBtn" class="primary-btn">Play</button>
        <div class="volume-box">
           <span class="small">Vol</span>
           <input type="range" id="volumeRange" min="0" max="100" value="50">
        </div>
      </div>
    </div>
  </div>

  <div class="home-grid">
    <div class="home-card music-card" data-vid="jfKfPfyJRdk" data-title="Lofi Girl Radio">
      <div class="card-icon">☕</div>
      <h3>Lofi Hip Hop</h3>
      <p class="desc">Musik santai 24/7 untuk menemani baca materi.</p>
      <button class="ghost-btn">Pilih Radio</button>
    </div>

    <div class="home-card music-card" data-vid="CHFif_y2TyM" data-title="Rainy Night">
      <div class="card-icon">🌧️</div>
      <h3>Suara Hujan</h3>
      <p class="desc">White noise alami untuk fokus mendalam.</p>
      <button class="ghost-btn">Pilih Suasana</button>
    </div>

    <div class="home-card music-card" data-vid="sj9G_S8v36M" data-title="Deep Focus">
      <div class="card-icon">🧠</div>
      <h3>Deep Focus</h3>
      <p class="desc">Ambient musik tanpa lirik untuk pengerjaan kuis.</p>
      <button class="ghost-btn">Pilih Musik</button>
    </div>

    <div class="home-card">
      <h3>💡 Tips</h3>
      <p class="small">Musik instrumental terbukti meningkatkan konsentrasi dibandingkan musik berlirik.</p>
    </div>
  </div>
</section>
`;
