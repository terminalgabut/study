import { supabase } from '../../services/supabase.js';
import { handleLogout } from './auth.js';

export async function initProfileModal() {
  const profileBtn = document.getElementById('profileHeaderBtn'); // Sekarang ID sudah ada
  const dropdown = document.getElementById('profileDropdown');
  const nameEl = document.getElementById('profileName');
  const userEl = document.getElementById('profileUsername');
  const avatarEl = document.getElementById('userAvatar');
  const btnLogout = document.getElementById('btnLogoutAction');
  const btnDelete = document.getElementById('btnDeleteAccount');

  if (!profileBtn || !dropdown) return;

  // --- LOGIKA TOGGLE ---
  profileBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
  };

  // Klik di luar untuk menutup modal
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== profileBtn) {
      dropdown.style.display = 'none';
    }
  });

  // --- LOAD DATA USER ---
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (nameEl) nameEl.innerText = profile.full_name || 'User';
        if (userEl) userEl.innerText = `@${profile.username}`;
        // Update foto di modal DAN di tombol header jika ingin sama
        const imgUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
        if (avatarEl) avatarEl.src = imgUrl;
        
        // Opsional: ganti juga foto kecil yang di header
        const headerImg = profileBtn.querySelector('img');
        if (headerImg) headerImg.src = imgUrl;
      }
    }
  } catch (err) {
    console.error("Gagal load profil:", err);
  }

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
        await supabase.from('profiles').delete().eq('id', user.id);
        await handleLogout();
      }
    };
  }
}
