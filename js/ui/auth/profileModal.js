// js/ui/auth/profileModal.js
import { supabase } from '../../services/supabase.js';
import { handleLogout } from './auth.js';

export async function initProfileModal() {
  const nameEl = document.getElementById('profileName');
  const userEl = document.getElementById('profileUsername');
  const avatarEl = document.getElementById('userAvatar');
  const btnLogout = document.getElementById('btnLogoutAction');

  try {
    // 1. Ambil data User yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 2. Ambil data dari tabel profiles publik
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        nameEl.innerText = profile.full_name || 'Gabuter';
        userEl.innerText = `@${profile.username}`;
        // Gunakan avatar dari database atau generate otomatis jika kosong
        avatarEl.src = profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
      }
    }
  } catch (err) {
    console.error("Gagal memuat profil modal:", err);
  }

  // 3. Logika Logout
  if (btnLogout) {
    btnLogout.onclick = async () => {
      if (confirm('Yakin ingin keluar?')) {
        await handleLogout();
      }
    };
  }
}
