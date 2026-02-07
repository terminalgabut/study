// pages/modalprofilView.js
export const modalprofilView = `
<div class="profile-dropdown" id="profileDropdown" style="display: none;">
  <div class="profile-info">
    <img id="userAvatar" src="https://ui-avatars.com/api/?name=User&background=random" alt="User Avatar">
    <div class="profile-text">
      <span class="profile-name" id="profileName">Loading...</span>
      <small class="profile-email" id="profileUsername">@username</small>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
  <div class="profile-actions">
    <button class="dropdown-btn" onclick="window.location.hash='#profile'">Lihat Profil</button>
    <button id="btnLogoutAction" class="dropdown-btn">Log Out</button>
    <button class="dropdown-btn danger" id="btnDeleteAccount">Hapus Akun</button>
  </div>
</div>
`;
