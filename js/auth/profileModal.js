// root/js/auth/profileModal.js

import { supabase } from '../services/supabase.js';
import { handleLogout } from './auth.js';

// Buat fungsi terpisah untuk mengambil data agar bisa dipanggil berulang kali
export async function fetchProfileData() {
  const nameEl = document.getElementById('profileName');
  const userEl = document.getElementById('profileUsername');
  const avatarEl = document.getElementById('userAvatar');
  const profileBtn = document.getElementById('profileHeaderBtn');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (nameEl) nameEl.innerText = profile.full_name || 'User';
        if (userEl) userEl.innerText = `@${profile.username}`;
        
        const imgUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
        if (avatarEl) avatarEl.src = imgUrl;
        
        const headerImg = profileBtn?.querySelector('img');
        if (headerImg) headerImg.src = imgUrl;
      }
    }
  } catch (err) {
    console.error("Gagal refresh profil:", err);
  }
}

export async function initProfileModal() {
  const profileBtn = document.getElementById('profileHeaderBtn');
  const dropdown = document.getElementById('profileDropdown');
  const btnLogout = document.getElementById('btnLogoutAction');
  const btnDelete = document.getElementById('btnDeleteAccount');

  if (!profileBtn || !dropdown) return;

  // --- LOGIKA TOGGLE ---
  profileBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    
    // Setiap kali dibuka, pastikan data terbaru diambil
    if (!isVisible) fetchProfileData();
  };

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== profileBtn) {
      dropdown.style.display = 'none';
    }
  });

  // --- AUTO REFRESH SAAT LOGIN ---
  // Ini memastikan saat user baru login, data langsung berubah dari "Memuat"
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') fetchProfileData();
  });

  // Jalankan fetch pertama kali
  fetchProfileData();

  // --- LOGIKA TOMBOL ---
  if (btnLogout) {
    btnLogout.onclick = async () => {
      if (confirm('Keluar dari aplikasi?')) await handleLogout();
    };
  }

  if (btnDelete) {
    btnDelete.onclick = async () => {
      if (confirm('Hapus data profil?')) {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            await supabase.from('profiles').delete().eq('id', user.id);
            await handleLogout();
        }
      }
    };
  }
}
