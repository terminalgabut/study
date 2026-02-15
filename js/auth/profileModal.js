// root/js/auth/profileModal.js

import { supabase } from '../services/supabase.js';
import { handleLogout } from './auth.js';

let isInitialized = false;
let authListenerAdded = false;

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    if (nameEl) nameEl.innerText = profile.full_name || 'User';
    if (userEl) userEl.innerText = `@${profile.username}`;

    const imgUrl =
      profile.avatar_url ||
      `https://ui-avatars.com/api/?name=${profile.username}&background=random`;

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
  if (isInitialized) return; // ⛔ cegah double init
  isInitialized = true;

  const profileBtn = document.getElementById('profileHeaderBtn');
  const dropdown = document.getElementById('profileDropdown');

  if (!profileBtn || !dropdown) return;

  const btnLogout = dropdown.querySelector('#btnLogoutAction');
  const btnDelete = dropdown.querySelector('#btnDeleteAccount');
  const btnViewProfile = dropdown.querySelector('#btnViewProfile');

  /* ===============================
     TOGGLE DROPDOWN
  ================================= */
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';

    if (!is
