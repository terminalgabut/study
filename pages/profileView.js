// root/pages/profileView.js

export const profileView = `
<section class="home">

  <!-- Hero -->
  <div class="home-card hero">
    <h1>👤 Profil Saya</h1>
    <p class="subtitle">
      Kelola informasi akun dan progres belajarmu
    </p>
  </div>

  <!-- Header Profil + Analytics Preview -->
  <div class="home-card">
    <div class="profile-top-section">

      <!-- Avatar Block -->
      <div class="profile-avatar-block">
        <div class="profile-avatar">
          <img 
            src="/assets/default-avatar.png" 
            alt="Foto Profil" 
            id="profileAvatar"
          />
        </div>

        <div class="profile-details">
  <p><strong id="profileFullName">Unknown</strong></p>
  <p>uid: <strong id="profileUuid">01010101</strong></p>

  <div class="profile-gamification">

  <!-- Level Center -->
  <div class="level-center-row">
    <span class="level-label">
      Lv.<span id="userLevel">1</span>
    </span>

    <span id="levelBadge" class="badge badge-beginner">
      Pemula
    </span>
  </div>

  <!-- XP Text -->
  <div class="xp-meta-row">
    <span id="userXP">7</span> /
    <span id="nextLevelXP">100</span> XP
  </div>

  <!-- XP Bar -->
  <div class="xp-bar">
    <div class="xp-fill" id="xpFill"></div>
  </div>

</div>
</div>

      <!-- Analytics Preview (Trend + Strength) -->
      <div class="profile-analytics-preview">

        <div class="trend-header">
          <strong>Cogitive Poin Trend</strong>
          <div class="trend-meta">
           <span id="iqTrendDelta"></span>
           <span id="volatilityBadge" class="volatility-badge"></span>
          </div>
        </div>

        <div class="chart-wrapper">
          <canvas id="iqTrendPreview"></canvas>
        </div>

        <div class="strength-summary">
  <p>
    <strong>Strength:</strong> 
    <span id="strengthText">-</span>
  </p>
  <p class="strength-desc" id="strengthDescription"></p>

  <p>
    <strong>Needs Work:</strong> 
    <span id="weaknessText">-</span>
  </p>
  <p class="weakness-desc" id="weaknessDescription"></p>
</div>

      </div>

    </div>
  </div>

  <!-- NAVIGASI INTERNAL PROFILE -->
  <div class="home-card profile-nav">
    <button class="profile-tab active" data-tab="homeProfile">Home</button>
    <button class="profile-tab" data-tab="materiProfile">Materiku</button>
    <button class="profile-tab" data-tab="statistikProfile">Statistik</button>
    <button class="profile-tab" data-tab="settingProfile">Setting</button>
  </div>

  <!-- AREA DINAMIS -->
  <div id="profileDynamicContent"></div>

</section>
`;
