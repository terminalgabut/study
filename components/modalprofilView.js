export const modalprofilView = `
<div class="profile-dropdown" id="profileDropdown">
  <div class="profile-info">
    <img id="userAvatar" src="https://ui-avatars.com/api/?name=User&background=random" alt="User Avatar">
    <div class="profile-text">
      <span class="profile-name" id="profileName">Loading...</span>
      <small class="profile-email" id="profileUsername">@username</small>
    </div>
  </div>
  
  <div class="profile-actions">
    <button class="dropdown-btn" onclick="window.location.hash='#profile'">
      <span>Lihat Profil</span>
    </button>
    <button id="btnLogoutAction" class="dropdown-btn">
      <span>Log Out</span>
    </button>
    <button id="btnDeleteAccount" class="dropdown-btn danger">
      <span>Hapus Akun</span>
    </button>
  </div>
</div>
`;
