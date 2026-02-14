export const timerView = `
<section class="timer-page page">
  <div class="home-card hero">
    <h1>Focus Timer ⏳</h1>
    <p class="subtitle">Tetap fokus, satu langkah setiap waktu.</p>
  </div>

  <div class="home-grid">
    <div class="home-card timer-main">
      <div class="timer-display">
        <span id="minutes">25</span>:<span id="seconds">00</span>
      </div>
      
      <div class="timer-controls">
        <button class="primary-btn" id="startTimerBtn">Mulai Fokus</button>
        <button class="secondary-btn hidden" id="stopTimerBtn">Berhenti</button>
        <button class="secondary-btn" id="resetTimerBtn">Reset</button>
      </div>
    </div>

    <div class="home-card">
      <h3>⚙️ Atur Waktu</h3>
      <div class="input-group">
        <input type="number" id="timerInput" value="25" min="1" max="60">
        <span class="small">Menit</span>
      </div>
      <p class="desc small" style="margin-top: 10px;">
        Gunakan teknik Pomodoro: 25 menit fokus, 5 menit istirahat.
      </p>
    </div>
  </div>
</section>
`;
