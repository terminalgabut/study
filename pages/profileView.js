// root/pages/profileView.js

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

  <div class="home-grid">

    <!-- Info Profil -->
    <div class="home-card">
      <h3>🪪 Informasi Akun</h3>

      <div class="profile-info">
        <!-- Foto Profil -->
        <div class="profile-avatar">
          <img 
            id="profileAvatar"
            src="https://via.placeholder.com/120"
            alt="Foto Profil"
          />
          <button class="secondary-btn small" id="changeAvatarBtn">
            Ganti Foto
          </button>
        </div>

        <!-- Detail Akun -->
        <div class="profile-details">
          <p>Email: <strong id="profileEmail">Memuat...</strong></p>
          <p>Username: <strong id="profileUsername">Memuat...</strong></p>
          <p>Full Name: <strong id="profileFullName">Memuat...</strong></p>
        </div>
      </div>
    </div>

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
