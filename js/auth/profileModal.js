// root/js/auth/profileModal.js

import { supabase } from '../services/supabase.js';
import { getProfile } from '../services/profileService.js';
import { handleLogout } from './auth.js';

let isInitialized = false;

/* ===============================
   FETCH PROFILE DATA
================================= */
export async function fetchProfileData() {
  const nameEl = document.getElementById('profileName');
  const userEl = document.getElementById('profileUsername');
  const avatarEl = document.getElementById('userAvatar');
  const profileBtn = document.getElementById('profileHeaderBtn');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Ambil profil dari service
    let profile = null;
    try {
      profile = await getProfile(user.id);
    } catch (e) {
      console.warn("Profil belum ada, pakai fallback.");
    }

    const displayName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User';

    const username =
      profile?.username ||
      displayName.toLowerCase().replace(/\s+/g, '');

    const imgUrl =
      profile?.avatar_url ||
      `https://ui-avatars.com/api/?name=${username}&background=random`;

    if (nameEl) nameEl.innerText = displayName;
    if (userEl) userEl.innerText = `@${username}`;
    if (avatarEl) avatarEl.src = imgUrl;

    const headerImg = profileBtn?.querySelector('img');
    if (headerImg) headerImg.src = imgUrl;

  } catch (err) {
    console.error('Gagal refresh profil:', err);
  }
}

/* ===============================
   INIT MODAL (SPA SAFE)
================================= */
export function initProfileModal() {
  if (isInitialized) return;
  isInitialized = true;

  const profileBtn = document.getElementById('profileHeaderBtn');
  const dropdown = document.getElementById('profileDropdown');

  if (!profileBtn || !dropdown) return;

  const btnLogout = dropdown.querySelector('#btnLogoutAction');
  const btnDelete = dropdown.querySelector('#btnDeleteAccount');
  const btnViewProfile = dropdown.querySelector('#btnViewProfile');

  // TOGGLE DROPDOWN
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';

    if (!isOpen) {
      fetchProfileData();
    }
  });

  // CLOSE WHEN CLICK OUTSIDE
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== profileBtn) {
      dropdown.style.display = 'none';
    }
  });

  // VIEW PROFILE
  if (btnViewProfile) {
    btnViewProfile.addEventListener('click', () => {
      dropdown.style.display = 'none';
      window.location.hash = '#profile';
    });
  }

  // LOGOUT
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (confirm('Keluar dari aplikasi?')) {
        await handleLogout();
      }
    });
  }

  // DELETE ACCOUNT
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (confirm('Hapus akun secara permanen?')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profile').delete();
          await handleLogout();
        }
      }
    });
  }
}
