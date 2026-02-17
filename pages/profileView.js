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

  <!-- Header Profil (TETAP) -->
  <div class="home-card">
    <div class="profile-info">
      
      <div class="profile-avatar">
        <img 
          src="/assets/default-avatar.png" 
          alt="Foto Profil" 
          id="profileAvatar"
        />
      </div>

      <div class="profile-details">
        <p><strong id="profileFullName">Unknown</strong></p>
        <p>uid: <strong id="profileUid">01010101</strong></p>
      </div>

    </div>
  </div>

  <!-- NAVIGASI INTERNAL PROFILE -->
  <div class="home-card profile-nav">
    <button class="profile-tab active" data-tab="homeProfile">Home</button>
    <button class="profile-tab" data-tab="materi">Materiku</button>
    <button class="profile-tab" data-tab="statistik">Statistik</button>
    <button class="profile-tab" data-tab="setting">Setting</button>
  </div>

  <!-- AREA DINAMIS -->
  <div id="profileDynamicContent"></div>

</section>
`;
