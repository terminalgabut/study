export const profileView = `
<section class="home">
  <div class="home-card hero">
    <h1>👤 Profil Saya</h1>
    <p class="subtitle">
      Kelola informasi akun dan progres belajarmu
    </p>
    <p class="desc">
      Update profil agar pengalaman belajar terasa lebih personal.
    </p>
  </div>

  <!-- Header Profil -->
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
      <p>Full Name: <strong id="profileFullName">Memuat...</strong></p>
    </div>

  </div>
</div>

  <div class="home-grid">

    <!-- Bio -->
    <div class="home-card">
      <h3>📝 Bio</h3>
      <p id="profileBio" class="desc">
        Memuat bio...
      </p>
    </div>

    <!-- XP -->
    <div class="home-card">
      <h3>⭐ XP & Progres</h3>
      <p>Total XP: <strong id="profileXP">0</strong></p>
      <div class="xp-bar">
        <div class="xp-fill" id="xpFill" style="width:0%"></div>
      </div>
    </div>

    <!-- Edit Button -->
    <div class="home-card">
      <h3>⚙️ Pengaturan</h3>
      <button class="primary-btn" id="editProfileBtn">
        Edit Profil
      </button>
    </div>

  </div>
</section>
`;
